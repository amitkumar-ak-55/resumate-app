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
    <div className="rounded-[28px] border border-white/10 bg-[rgba(9,10,24,0.82)] p-1 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(21,22,44,0.92),rgba(8,9,20,0.96))] p-6 sm:p-8">
        <div className="mb-8">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            Uploader
          </div>
          <h2 className="precision-display mt-4 text-3xl tracking-tight text-white sm:text-4xl">
            Build the optimized version here.
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Add your current resume and the target job description. We will tune the language, strengthen alignment,
            and prepare the output for the analysis section below.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
        <div>
          <label className="mb-3 block text-sm font-semibold text-white/85">
            Upload Your Resume
          </label>
          <input
            ref={fileInputRef}
            id="resume"
            type="file"
            accept=".pdf,.docx"
            onChange={onFileUpload}
            className="hidden"
          />
          <label
            htmlFor="resume"
            className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 text-center transition hover:border-violet-300/40 hover:bg-white/[0.05]"
          >
            <span className="mb-2 text-3xl text-violet-200">Resume</span>
            <span className="text-sm text-white/55">
              Click to upload or drag and drop
              <br />
              PDF or DOCX (Max {MAX_FILE_SIZE_LABEL})
            </span>
          </label>

          {resumeFile && (
            <div className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/8 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-emerald-200">Resume</span>
                <span className="text-sm font-medium text-emerald-50">{resumeFile.name}</span>
                <span className="text-xs text-emerald-100/70">
                  ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB of {(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB)
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-white/85">
            Job Description
          </label>
          <textarea
            rows={10}
            value={jobDescription}
            onChange={(event) => onJobDescriptionChange(event.target.value)}
            className="w-full resize-none rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-violet-300/45 focus:ring-2 focus:ring-violet-400/15"
            placeholder={`Paste the full job description here... (minimum ${MIN_JOB_DESCRIPTION_LENGTH} characters)`}
          />
          <p className="mt-2 text-xs text-white/45">
            {jobDescription.length} characters - Minimum {MIN_JOB_DESCRIPTION_LENGTH} characters required
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4">
            <div className="flex items-center space-x-2">
              <span className="text-rose-200">Error</span>
              <span className="text-sm text-rose-50">{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !!submissionError}
          className="precision-cta flex w-full items-center justify-center rounded-full px-6 py-4 text-lg font-medium text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Optimizing Your Resume...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>AI</span>
              <span>Run Resume Optimization</span>
            </div>
          )}
        </button>
        </form>
      </div>
    </div>
  );
}
