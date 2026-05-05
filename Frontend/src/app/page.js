'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, FileText, ScanSearch, Sparkles } from 'lucide-react';

import ResultsPanel from '../components/ResultsPanel';
import UploadForm from '../components/UploadForm';
import {
  downloadGeneratedFile,
  optimizeResumeRequest,
  validateResumeFile,
  validateSubmission,
} from '../lib/resumate';

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Drop in your current resume',
    description: 'Start with the version you already use so the system can detect weak wording, missing keywords, and role mismatch.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Match it to the target role',
    description: 'Paste the job description and the optimizer maps your experience against the actual expectations of that role.',
    icon: ScanSearch,
  },
  {
    step: '03',
    title: 'Review the analysis output',
    description: 'Download the optimized resume and cover letter, then review the alignment improvements in one focused analysis zone.',
    icon: Sparkles,
  },
];

const ANALYSIS_POINTS = [
  'Keyword alignment against the target role',
  'Stronger executive-facing phrasing and positioning',
  'Resume plus cover letter output for immediate use',
];

export default function ResumateApp() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);
  const uploadSectionRef = useRef(null);
  const analysisSectionRef = useRef(null);

  const submissionError = validateSubmission(resumeFile, jobDescription);

  useEffect(() => {
    if (results) {
      analysisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const validationError = validateResumeFile(file);
    if (validationError) {
      setError(validationError);
      setResumeFile(null);
      return;
    }

    setError('');
    setResumeFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submissionError) {
      setError(submissionError);
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await optimizeResumeRequest(resumeFile, jobDescription);
      setResults(data);
    } catch (requestError) {
      setError(`Failed to optimize resume: ${requestError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url, fileName) => {
    try {
      await downloadGeneratedFile(url, fileName);
    } catch {
      setError('Download failed');
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setJobDescription('');
    setResults(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen text-white">
      <main className="relative overflow-hidden">
        <section className="precision-hero relative flex min-h-screen flex-col">
          <div className="precision-grid absolute inset-0" />
          <div className="precision-vignette absolute inset-0" />
          <div className="precision-orb precision-orb-top absolute left-1/2 top-[23%] -translate-x-1/2" />
          <div className="precision-orb precision-orb-bottom absolute left-1/2 top-[52%] -translate-x-1/2" />
          <div className="precision-web precision-web-left absolute inset-y-0 left-0 w-[34%]" />
          <div className="precision-web precision-web-right absolute inset-y-0 right-0 w-[34%]" />

          <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-4 pb-16 pt-5 sm:px-6 lg:px-8">
            <div className="flex justify-end">
              <a
                href="#analysis"
                className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/78 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                History
              </a>
            </div>

            <div className="flex flex-1 items-center justify-center py-16">
              <div className="mx-auto max-w-[820px] px-4 text-center">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.06] px-5 py-2 text-[0.72rem] uppercase tracking-[0.22em] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  Resume Optimization Workflow
                </div>

                <h1 className="precision-display mx-auto mt-6 max-w-[760px] text-5xl leading-[1.03] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.8rem]">
                  Turn your resume into
                  <br />
                  a sharper role-matched <span className="text-[#c8b2c7]">application</span>
                </h1>
                
                <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60">
                  Beat the ATS and land your next interview faster.
                </p>

                <div className="mt-10 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={scrollToUpload}
                    className="precision-cta precision-cta-float inline-flex items-center justify-center rounded-full px-10 py-4 text-lg font-medium text-white"
                  >
                    Start Optimization
                  </button>
                </div>

                <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
                  {ANALYSIS_POINTS.map((point) => (
                    <div
                      key={point}
                      className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 text-sm leading-6 text-white/68 backdrop-blur-sm"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => document.getElementById('flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="mx-auto flex flex-col items-center gap-1 text-white/55 transition hover:text-white/80"
            >
              <span className="text-sm">See how the product flows</span>
              <ArrowDown className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section id="flow" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {FLOW_STEPS.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,22,42,0.88),rgba(8,10,22,0.92))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] transition hover:border-violet-300/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10">
                      <Icon className="h-5 w-5 text-violet-200" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">Step {item.step}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/62">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={scrollToUpload}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/84 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              Jump To Uploader
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section
          id="upload"
          ref={uploadSectionRef}
          className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.26em] text-white/45">Resume Optimizer</p>
            <h2 className="precision-display mt-4 text-4xl text-white sm:text-5xl">
              Upload your resume and target role details.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/60">
              Add your resume, paste the job description, and we will send you to
              the analysis section once the optimization is ready.
            </p>
          </div>

          <UploadForm
            error={error}
            fileInputRef={fileInputRef}
            isLoading={isLoading}
            jobDescription={jobDescription}
            onFileUpload={handleFileUpload}
            onJobDescriptionChange={setJobDescription}
            onSubmit={handleSubmit}
            resumeFile={resumeFile}
            submissionError={submissionError}
          />
        </section>

        <section
          id="analysis"
          ref={analysisSectionRef}
          className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8"
        >
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.26em] text-white/45">History Analysis</p>
            <h2 className="precision-display mt-4 text-4xl text-white sm:text-5xl">
              Review the optimized output.
            </h2>
            </div>

          {results ? (
            <ResultsPanel
              results={results}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          ) : (
            <div className="analysis-waiting-wrapper">
              <div className="analysis-waiting-panel">
                <div className="analysis-waiting-inner">
                  <div className="analysis-waiting-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="analysis-waiting-lock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <p className="analysis-waiting-label">Waiting For Analysis</p>
                  <h3 className="analysis-waiting-title">Run the optimizer to unlock this section.</h3>
                  <p className="analysis-waiting-desc">
                    Once you submit the uploader form, the optimized resume, cover letter, and analysis summary will land
                    here automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
