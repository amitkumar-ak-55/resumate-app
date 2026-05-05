export const DEFAULT_API_BASE_URL = 'http://localhost:8000';
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MIN_JOB_DESCRIPTION_LENGTH = 50;
export const MAX_FILE_SIZE_LABEL = `${(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0)}MB`;
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE_URL;

export const DOWNLOADS = [
  {
    key: 'resume_url',
    label: 'Download Resume',
    fileName: 'optimized-resume.docx',
    icon: 'Resume',
    className: 'btn-primary',
  },
  {
    key: 'cover_letter_url',
    label: 'Download Cover Letter',
    fileName: 'cover-letter.docx',
    icon: 'Cover',
    className: 'btn-primary bg-purple-600 hover:bg-purple-700',
  },
];

export const RESULT_HIGHLIGHTS = [
  'Integrated relevant keywords from the job description',
  'Optimized for Applicant Tracking Systems (ATS)',
  'Enhanced skill descriptions and achievements',
  'Generated a personalized cover letter',
];
