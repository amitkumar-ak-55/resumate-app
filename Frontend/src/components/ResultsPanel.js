import { DOWNLOADS, RESULT_HIGHLIGHTS } from '../lib/resumate';

export default function ResultsPanel({ onDownload, onReset, results }) {
  const hasDownloads = results.resume_url && results.cover_letter_url;

  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,17,34,0.95),rgba(8,9,19,0.98))] p-1 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(32,38,80,0.9),rgba(15,16,31,0.96))] px-8 py-8 text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-white/55">Analysis Ready</p>
        <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Your optimization is complete.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/72">
          Review the outputs, download the updated files, and use the analysis notes to understand what improved.
        </p>
      </div>

      <div className="space-y-6 p-8">
        {hasDownloads ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {DOWNLOADS.map((download) => (
                <button
                  key={download.key}
                  onClick={() => onDownload(results[download.key], download.fileName)}
                  className={`${download.className} flex items-center justify-center space-x-2`}
                >
                  <span>{download.icon}</span>
                  <span>{download.label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-[24px] border border-blue-300/15 bg-blue-400/10 p-5">
              <div className="flex items-start space-x-3">
                <span className="text-blue-200 text-lg mt-0.5">Info</span>
                <div>
                  <h3 className="mb-3 font-semibold text-blue-50">What changed in the analysis:</h3>
                  <ul className="space-y-2 text-sm text-blue-100/80">
                    {RESULT_HIGHLIGHTS.map((highlight) => (
                      <li key={highlight}>- {highlight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] py-8 text-center">
            <p className="text-white/70">{results.message || 'Files processed successfully.'}</p>
          </div>
        )}

        <button
          onClick={onReset}
          className="btn-secondary flex w-full items-center justify-center space-x-2"
        >
          <span>Reset</span>
          <span>Start Another Optimization</span>
        </button>
      </div>
    </div>
  );
}
