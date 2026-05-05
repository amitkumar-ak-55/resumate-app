import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  MIN_JOB_DESCRIPTION_LENGTH,
} from './constants';

export function validateResumeFile(file) {
  if (!file) {
    return 'Please upload a resume file.';
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Please upload a PDF or DOCX file only.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large. Maximum size is ${MAX_FILE_SIZE_LABEL}.`;
  }

  return '';
}

export function validateSubmission(resumeFile, jobDescription) {
  if (!resumeFile || !jobDescription.trim()) {
    return 'Please upload a resume file and enter a job description.';
  }

  if (jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH) {
    return `Job description too short. Please provide at least ${MIN_JOB_DESCRIPTION_LENGTH} characters.`;
  }

  return '';
}

