import { API_BASE_URL } from './constants';

export async function optimizeResumeRequest(resumeFile, jobDescription) {
  const formData = new FormData();
  formData.append('resume_file', resumeFile);
  formData.append('job_description', jobDescription.trim());

  const response = await fetch(`${API_BASE_URL}/optimize-resume`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function downloadGeneratedFile(url, name) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Download failed');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

async function parseApiError(response) {
  const errorText = await response.text();

  try {
    const errorData = JSON.parse(errorText);
    return errorData.message || errorData.detail || `Server error: ${response.status}`;
  } catch {
    return `Server error: ${response.status} - ${errorText}`;
  }
}

