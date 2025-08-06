from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import os
import tempfile
import shutil
from datetime import datetime
import uuid

from services.file_parser import parse_resume
from services.ai_service import optimize_resume_content
from services.docx_generator import create_resume_docx, create_cover_letter_docx

app = FastAPI(
    title="Resumate API",
    description="AI-powered resume optimization service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory for file storage
TEMP_DIR = tempfile.mkdtemp()
os.makedirs(TEMP_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Resumate API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/optimize-resume")
async def optimize_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        # Validate file type
        allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if resume_file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Please upload a PDF or DOCX file."
            )
        
        # Validate job description
        if not job_description or len(job_description.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Job description must be at least 100 characters long."
            )
        
        # Save uploaded file temporarily
        file_id = str(uuid.uuid4())
        file_extension = ".pdf" if resume_file.content_type == "application/pdf" else ".docx"
        temp_file_path = os.path.join(TEMP_DIR, f"{file_id}{file_extension}")
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(resume_file.file, buffer)
        
        # Parse resume content
        resume_text = parse_resume(temp_file_path)
        
        # Generate optimized content using AI
        optimization_result = await optimize_resume_content(resume_text, job_description)
        
        # Generate output file paths
        resume_filename = f"Optimized_Resume_{file_id}.docx"
        cover_letter_filename = f"Cover_Letter_{file_id}.docx"
        
        resume_path = os.path.join(TEMP_DIR, resume_filename)
        cover_letter_path = os.path.join(TEMP_DIR, cover_letter_filename)
        
        # Create DOCX files
        create_resume_docx(optimization_result["optimized_resume"], resume_path)
        create_cover_letter_docx(optimization_result["cover_letter"], cover_letter_path)
        
        # Clean up original uploaded file
        os.remove(temp_file_path)
        
        # Return download URLs
        base_url = os.getenv("BASE_URL", "http://localhost:8000")
        
        return {
            "resumeFileName": resume_filename,
            "resumeDownloadUrl": f"{base_url}/download/{resume_filename}",
            "coverLetterFileName": cover_letter_filename,
            "coverLetterDownloadUrl": f"{base_url}/download/{cover_letter_filename}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(TEMP_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

# Cleanup endpoint (optional, for production you might want to use a scheduled job)
@app.delete("/cleanup")
async def cleanup_old_files():
    try:
        current_time = datetime.now().timestamp()
        cleaned_count = 0
        
        for filename in os.listdir(TEMP_DIR):
            file_path = os.path.join(TEMP_DIR, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getctime(file_path)
                # Remove files older than 1 hour
                if file_age > 3600:
                    os.remove(file_path)
                    cleaned_count += 1
        
        return {"message": f"Cleaned up {cleaned_count} old files"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)