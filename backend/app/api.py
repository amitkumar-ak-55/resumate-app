from datetime import datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from .config import (
    ALLOWED_FILE_TYPES,
    ALLOWED_ORIGINS,
    CLEANUP_INTERVAL_HOURS,
    DEBUG,
    HOST,
    MAX_FILE_SIZE_MB,
    PORT,
    RATE_LIMIT_PER_MINUTE,
    TEMP_DIR,
    ensure_temp_dir,
    logger,
)
from .optimizer import ResumeOptimizer, initialize_model
from .processing import (
    build_file_extractors,
    build_success_response,
    extract_resume_text,
    log_upload_request,
    save_output_files,
    validate_upload_request,
)

ensure_temp_dir()
optimizer = ResumeOptimizer(initialize_model())
file_extractors = build_file_extractors(optimizer)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Resumate API",
    description="AI-Powered Resume Optimization Service",
    version="1.0.0",
    debug=DEBUG,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def cleanup_old_files() -> None:
    """Clean up generated files older than the configured interval."""
    if not TEMP_DIR.exists():
        return

    current_time = datetime.now()
    cleanup_threshold = timedelta(hours=CLEANUP_INTERVAL_HOURS)
    for file_path in TEMP_DIR.iterdir():
        if file_path.is_file():
            file_modified = datetime.fromtimestamp(file_path.stat().st_mtime)
            if current_time - file_modified > cleanup_threshold:
                try:
                    file_path.unlink()
                    logger.info(f"Cleaned up old file: {file_path.name}")
                except Exception as exc:
                    logger.error(f"Failed to cleanup file {file_path.name}: {exc}")


@app.get("/")
async def root():
    """Basic health check for quick status checks."""
    ai_status = "Gemini AI Connected" if optimizer.use_gemini else "Demo Mode (No AI Key)"
    return {
        "message": "Resumate API is running",
        "status": "healthy",
        "ai_service": ai_status,
        "version": "1.0.0",
        "config": {
            "max_file_size_mb": MAX_FILE_SIZE_MB,
            "allowed_file_types": ALLOWED_FILE_TYPES,
            "rate_limit_per_minute": RATE_LIMIT_PER_MINUTE,
            "debug_mode": DEBUG,
        },
    }


@app.get("/health")
async def health_check():
    """Detailed health information used by the frontend or deployment checks."""
    return {
        "status": "healthy",
        "ai_configured": optimizer.use_gemini,
        "temp_dir_exists": TEMP_DIR.exists(),
        "config": {
            "host": HOST,
            "port": PORT,
            "debug": DEBUG,
            "allowed_origins": ALLOWED_ORIGINS,
            "max_file_size_mb": MAX_FILE_SIZE_MB,
        },
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/optimize-resume")
async def optimize_resume(
    request: Request,
    resume_file: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    job_description: str = Form(..., description="Job description text"),
):
    """Handle the full optimization workflow from upload to generated files."""
    try:
        log_upload_request(resume_file, job_description)
        normalized_job_description = validate_upload_request(resume_file, job_description)
        original_resume_text = await extract_resume_text(resume_file, file_extractors)

        logger.info("Extracting keywords from job description")
        keywords = optimizer.extract_keywords(normalized_job_description)

        logger.info("Optimizing resume")
        optimized_resume = optimizer.optimize_resume(
            original_resume_text,
            normalized_job_description,
            keywords,
        )

        logger.info("Generating cover letter")
        cover_letter = optimizer.generate_cover_letter(
            optimized_resume,
            normalized_job_description,
        )

        file_paths = save_output_files(optimizer, optimized_resume, cover_letter)
        logger.info("Processing completed successfully")
        return build_success_response(
            request=request,
            resume_file=resume_file,
            keywords=keywords,
            file_paths=file_paths,
            ai_powered=optimizer.use_gemini,
        )
    except HTTPException as exc:
        logger.error(f"Validation error: {exc.detail}")
        raise
    except Exception as exc:
        logger.error(f"Unexpected error: {exc}")
        raise HTTPException(status_code=500, detail=f"Processing error: {exc}") from exc


@app.get("/download/{filename}")
async def download_file(filename: str):
    """Serve generated documents while blocking path traversal."""
    if Path(filename).name != filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_path = TEMP_DIR / filename
    if not file_path.exists():
        logger.error(f"File not found: {file_path}")
        temp_files = list(TEMP_DIR.glob("*"))
        logger.info(f"Available files: {[file.name for file in temp_files]}")
        raise HTTPException(status_code=404, detail="File not found")

    logger.info(f"Serving file: {filename} ({file_path.stat().st_size} bytes)")
    try:
        return FileResponse(
            path=str(file_path),
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as exc:
        logger.error(f"Error serving file: {exc}")
        raise HTTPException(status_code=500, detail="Could not serve file") from exc


@app.on_event("startup")
async def startup_event():
    """Log startup details and prune stale generated files."""
    logger.info("Resumate API Server Starting")
    logger.info(f"Temp directory: {TEMP_DIR.absolute()}")
    logger.info(f"AI Provider: {'Gemini AI' if optimizer.use_gemini else 'Demo Mode'}")
    logger.info(f"Rate limit: {RATE_LIMIT_PER_MINUTE} requests/minute")
    logger.info(f"Max file size: {MAX_FILE_SIZE_MB}MB")
    logger.info(f"Allowed types: {', '.join(ALLOWED_FILE_TYPES)}")
    logger.info(f"CORS origins: {', '.join(ALLOWED_ORIGINS)}")

    if not optimizer.use_gemini:
        logger.warning("No AI API key configured. Using demo mode.")
        logger.warning("Add GEMINI_API_KEY to your .env file for full functionality.")

    cleanup_old_files()
    logger.info("Server ready")


@app.on_event("shutdown")
async def shutdown_event():
    """Prune old generated files on shutdown as well."""
    logger.info("Running final cleanup")
    cleanup_old_files()
    logger.info("Cleanup completed - Server shutdown")


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Return a consistent JSON error shape for client-side handling."""
    logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat(),
        },
    )

