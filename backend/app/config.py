import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()
IS_VERCEL = bool(os.getenv("VERCEL")) or bool(os.getenv("VERCEL_ENV"))

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

ALLOWED_ORIGINS_STR = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in ALLOWED_ORIGINS_STR.split(",")
    if origin.strip()
]

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 10))
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_FILE_TYPES_STR = os.getenv("ALLOWED_FILE_TYPES", "pdf,docx")
ALLOWED_FILE_TYPES = [
    file_type.strip()
    for file_type in ALLOWED_FILE_TYPES_STR.split(",")
    if file_type.strip()
]

FILE_TYPE_MAPPING = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_CONTENT_TYPES = [
    FILE_TYPE_MAPPING[file_type]
    for file_type in ALLOWED_FILE_TYPES
    if file_type in FILE_TYPE_MAPPING
]
MIN_JOB_DESCRIPTION_LENGTH = 50
MIN_RESUME_TEXT_LENGTH = 100

DEFAULT_TEMP_DIR = "/tmp/resumate" if IS_VERCEL else "temp_files"
TEMP_DIR = Path(os.getenv("TEMP_DIR", DEFAULT_TEMP_DIR))
CLEANUP_INTERVAL_HOURS = int(os.getenv("CLEANUP_INTERVAL_HOURS", 24))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", 10))

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FILE = os.getenv("LOG_FILE", "resumate.log")
LOG_TO_FILE = os.getenv("LOG_TO_FILE", "false" if IS_VERCEL else "true").lower() == "true"

OUTPUT_FILE_LABELS = {
    "resume": "Optimized Resume",
    "cover_letter": "Cover Letter",
}


def configure_logging() -> logging.Logger:
    handlers: list[logging.Handler] = [logging.StreamHandler()]
    if LOG_TO_FILE:
        handlers.append(logging.FileHandler(LOG_FILE))

    logging.basicConfig(
        level=getattr(logging, LOG_LEVEL),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=handlers,
    )
    
    # Silence noisy external loggers to prevent spam and infinite loops
    logging.getLogger("watchfiles.main").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    return logging.getLogger(__name__)


logger = configure_logging()


def ensure_temp_dir() -> None:
    """Create the temp directory once and fail fast if unavailable."""
    try:
        TEMP_DIR.mkdir(parents=True, exist_ok=True)
        logger.info(f"Temp directory: {TEMP_DIR.absolute()}")
    except Exception as exc:
        logger.error(f"Failed to create temp directory: {exc}")
        raise RuntimeError("Failed to create temp directory for file storage") from exc
