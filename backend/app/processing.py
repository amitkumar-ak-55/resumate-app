import zipfile
from datetime import datetime
from pathlib import Path

from fastapi import HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from .config import (
    ALLOWED_CONTENT_TYPES,
    ALLOWED_FILE_TYPES,
    FILE_TYPE_MAPPING,
    MAX_FILE_SIZE,
    MAX_FILE_SIZE_MB,
    MIN_JOB_DESCRIPTION_LENGTH,
    MIN_RESUME_TEXT_LENGTH,
    OUTPUT_FILE_LABELS,
    TEMP_DIR,
    logger,
)
from .optimizer import ResumeOptimizer


def build_file_extractors(optimizer: ResumeOptimizer) -> dict[str, callable]:
    """Map content types to the extractor that knows how to read them."""
    return {
        FILE_TYPE_MAPPING["pdf"]: optimizer.extract_text_from_pdf,
        FILE_TYPE_MAPPING["docx"]: optimizer.extract_text_from_docx,
    }


def log_upload_request(resume_file: UploadFile, job_description: str) -> None:
    """Log upload metadata in a single, consistent format."""
    logger.info("Upload request received")
    logger.info(f"File name: {resume_file.filename or 'None'}")
    logger.info(f"File type: {resume_file.content_type or 'None'}")
    logger.info(f"File size: {resume_file.size or 0} bytes")
    logger.info(f"Job description length: {len(job_description or '')} chars")


def validate_upload_request(resume_file: UploadFile, job_description: str) -> str:
    """Validate the incoming payload and normalize the job description."""
    if not resume_file:
        raise HTTPException(status_code=422, detail="No resume file provided")

    if not resume_file.filename:
        raise HTTPException(status_code=422, detail="Empty filename")

    if not resume_file.content_type:
        raise HTTPException(status_code=422, detail="Unable to determine file type")

    if resume_file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid file type. Only {', '.join(ALLOWED_FILE_TYPES).upper()} files are allowed.",
        )

    if resume_file.size and resume_file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=422,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB",
        )

    normalized_job_description = (job_description or "").strip()
    if not normalized_job_description:
        raise HTTPException(status_code=422, detail="Job description is empty")

    if len(normalized_job_description) < MIN_JOB_DESCRIPTION_LENGTH:
        raise HTTPException(
            status_code=422,
            detail=f"Job description too short. Please provide at least {MIN_JOB_DESCRIPTION_LENGTH} characters.",
        )

    return normalized_job_description


async def extract_resume_text(
    resume_file: UploadFile,
    file_extractors: dict[str, callable],
) -> str:
    """Read the uploaded file and extract text with one content-type lookup."""
    extractor = file_extractors.get(resume_file.content_type)
    if extractor is None:
        raise HTTPException(status_code=422, detail="Unsupported file type")

    file_content = await resume_file.read()
    original_resume_text = extractor(file_content).strip()

    if not original_resume_text:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from resume. Please ensure the file is not corrupted or password-protected.",
        )

    if len(original_resume_text) < MIN_RESUME_TEXT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail="Resume content too short. Please upload a complete resume with sufficient content.",
        )

    return original_resume_text


def save_output_files(
    optimizer: ResumeOptimizer,
    optimized_resume: str,
    cover_letter: str,
) -> dict[str, Path]:
    """Persist generated files so the API can return download URLs."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_paths = {
        "resume": TEMP_DIR / f"optimized_resume_{timestamp}.docx",
        "cover_letter": TEMP_DIR / f"cover_letter_{timestamp}.docx",
        "zip": TEMP_DIR / f"resumate_documents_{timestamp}.zip",
    }

    file_contents = {
        "resume": optimizer.create_docx_from_text(optimized_resume, OUTPUT_FILE_LABELS["resume"]),
        "cover_letter": optimizer.create_docx_from_text(cover_letter, OUTPUT_FILE_LABELS["cover_letter"]),
    }

    for key in ("resume", "cover_letter"):
        with open(file_paths[key], "wb") as file_handle:
            file_handle.write(file_contents[key])

    with zipfile.ZipFile(file_paths["zip"], "w", zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.write(file_paths["resume"], file_paths["resume"].name)
        zip_file.write(file_paths["cover_letter"], file_paths["cover_letter"].name)

    return file_paths


def build_success_response(
    request: Request,
    resume_file: UploadFile,
    keywords: str,
    file_paths: dict[str, Path],
    ai_powered: bool,
) -> JSONResponse:
    """Build the API response payload in one place."""
    base_url = f"{request.url.scheme}://{request.url.netloc}"
    original_size_kb = round((resume_file.size or 0) / 1024, 2)

    return JSONResponse(
        {
            "status": "success",
            "message": "Resume optimized successfully",
            "resume_url": f"{base_url}/download/{file_paths['resume'].name}",
            "cover_letter_url": f"{base_url}/download/{file_paths['cover_letter'].name}",
            "zip_url": f"{base_url}/download/{file_paths['zip'].name}",
            "ai_powered": ai_powered,
            "keywords_extracted": len(keywords.splitlines()) if keywords else 0,
            "processing_time": datetime.now().isoformat(),
            "file_info": {
                "original_size_kb": original_size_kb,
                "content_type": resume_file.content_type,
                "filename": resume_file.filename,
            },
        }
    )

