import { Upload, FileText, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  MIN_JOB_DESCRIPTION_LENGTH,
} from '../lib/resumate';

export default function UploadForm({
  error,
  fileInputRef,
  isLoading,
  jobDescription,
  onFileUpload,
  onJobDescriptionChange,
  onSubmit,
  resumeFile,
  submissionError,
}) {
  return (
    <form onSubmit={onSubmit} className="upload-form-wrapper">
      {/* ── Two-panel layout ── */}
      <div className="upload-panels">
        {/* ── Left: Resume Upload Panel ── */}
        <div className="upload-panel upload-panel-left">
          <div className="upload-panel-inner">
            <input
              ref={fileInputRef}
              id="resume"
              type="file"
              accept=".pdf,.docx"
              onChange={onFileUpload}
              className="hidden"
            />
            <label htmlFor="resume" className="upload-dropzone">
              <div className="upload-dropzone-icon">
                <Upload className="upload-icon-svg" />
              </div>
              <p className="upload-dropzone-title">Drop your resume here.</p>
              <p className="upload-dropzone-hint">
                Click to upload or drag and drop.
                <br />
                PDF or DOCX (Max {MAX_FILE_SIZE_LABEL})
              </p>
            </label>

            {resumeFile && (
              <div className="upload-file-info">
                <div className="upload-file-icon">
                  <FileText className="upload-file-icon-svg" />
                </div>
                <div className="upload-file-details">
                  <span className="upload-file-name">{resumeFile.name}</span>
                  <span className="upload-file-meta">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB •{' '}
                    {resumeFile.type === 'application/pdf' ? 'PDF' : 'DOCX'} • Uploaded
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Job Description Panel ── */}
        <div className="upload-panel upload-panel-right">
          <div className="upload-panel-inner">
            <textarea
              rows={10}
              value={jobDescription}
              onChange={(event) => onJobDescriptionChange(event.target.value)}
              className="upload-textarea"
              placeholder={`Paste the full job description here... (minimum ${MIN_JOB_DESCRIPTION_LENGTH} characters)`}
            />
            <p className="upload-char-count">
              {jobDescription.length} characters – Minimum {MIN_JOB_DESCRIPTION_LENGTH} characters required
            </p>
          </div>
        </div>
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div className="upload-error">
          <AlertCircle className="upload-error-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Submit Button ── */}
      <div className="upload-submit-row">
        <button
          type="submit"
          disabled={isLoading || !!submissionError}
          className="upload-submit-btn"
        >
          {isLoading ? (
            <>
              <Loader2 className="upload-btn-icon upload-btn-spinner" />
              <span>Optimizing Your Resume…</span>
            </>
          ) : (
            <>
              <Sparkles className="upload-btn-icon" />
              <span>Run Optimization</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
