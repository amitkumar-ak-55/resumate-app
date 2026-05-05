import { Download, FileText, Mail, RefreshCw, CheckCircle, Info } from 'lucide-react';
import { DOWNLOADS, RESULT_HIGHLIGHTS } from '../lib/resumate';

export default function ResultsPanel({ onDownload, onReset, results }) {
  const hasDownloads = results.resume_url && results.cover_letter_url;

  const downloadIcons = {
    resume_url: FileText,
    cover_letter_url: Mail,
  };

  return (
    <div className="results-wrapper">
      {/* ── Header Card ── */}
      <div className="results-header-panel">
        <div className="results-header-inner">
          <div className="results-status-badge">
            <CheckCircle className="results-status-icon" />
            <span>Analysis Ready</span>
          </div>
          <h2 className="results-header-title">
            Your optimization is complete.
          </h2>
          <p className="results-header-desc">
            Review the outputs, download the updated files, and use the analysis notes to understand what improved.
          </p>
        </div>
      </div>

      {hasDownloads ? (
        <>
          {/* ── Two-panel Download Cards ── */}
          <div className="results-panels">
            {DOWNLOADS.map((download) => {
              const Icon = downloadIcons[download.key] || FileText;
              return (
                <div key={download.key} className="results-download-panel">
                  <div className="results-download-inner">
                    <div className="results-download-icon-wrap">
                      <Icon className="results-download-icon-svg" />
                    </div>
                    <h3 className="results-download-title">{download.label}</h3>
                    <p className="results-download-filename">{download.fileName}</p>
                    <button
                      type="button"
                      onClick={() => onDownload(results[download.key], download.fileName)}
                      className="results-download-btn"
                    >
                      <Download className="results-download-btn-icon" />
                      <span>Download File</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Analysis Highlights Panel ── */}
          <div className="results-highlights-panel">
            <div className="results-highlights-inner">
              <div className="results-highlights-header">
                <Info className="results-highlights-info-icon" />
                <h3 className="results-highlights-title">What changed in the analysis</h3>
              </div>
              <ul className="results-highlights-list">
                {RESULT_HIGHLIGHTS.map((highlight) => (
                  <li key={highlight} className="results-highlight-item">
                    <CheckCircle className="results-highlight-check" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="results-message-panel">
          <div className="results-message-inner">
            <p>{results.message || 'Files processed successfully.'}</p>
          </div>
        </div>
      )}

      {/* ── Reset Button ── */}
      <div className="results-reset-row">
        <button type="button" onClick={onReset} className="results-reset-btn">
          <RefreshCw className="results-reset-icon" />
          <span>Start Another Optimization</span>
        </button>
      </div>
    </div>
  );
}
