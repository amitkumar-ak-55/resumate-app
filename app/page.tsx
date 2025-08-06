'use client';

import { useState } from 'react';
import ResumeUploader from '@/components/ResumeUploader';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import { Upload, FileText, Download, Sparkles } from 'lucide-react';

export interface OptimizationResult {
  resumeFileName: string;
  resumeDownloadUrl: string;
  coverLetterFileName: string;
  coverLetterDownloadUrl: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'job-description' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentStep('job-description');
  };

  const handleJobDescriptionSubmit = async (description: string) => {
    setJobDescription(description);
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume_file', uploadedFile!);
      formData.append('job_description', description);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/optimize-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to optimize resume');
      }

      const data = await response.json();
      setResults(data);
      setCurrentStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while optimizing your resume');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setJobDescription('');
    setResults(null);
    setError('');
  };

  const steps = [
    { id: 'upload', icon: Upload, label: 'Upload Resume', active: currentStep === 'upload' },
    { id: 'job-description', icon: FileText, label: 'Job Description', active: currentStep === 'job-description' },
    { id: 'results', icon: Download, label: 'Download Results', active: currentStep === 'results' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Resumate
              </h1>
            </div>
            <p className="text-gray-600 hidden sm:block">AI-Powered Resume Optimization</p>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = 
              (step.id === 'upload' && uploadedFile) ||
              (step.id === 'job-description' && jobDescription) ||
              (step.id === 'results' && results);
            const isCurrent = step.active;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${index !== steps.length - 1 ? 'mr-8' : ''}`}>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 
                    ${isCurrent 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {index !== steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <button
                onClick={resetFlow}
                className="mt-2 text-red-600 hover:text-red-700 font-medium underline"
              >
                Start Over
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-12 h-12 mx-auto mb-6 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Optimizing Your Resume</h3>
              <p className="text-gray-600 mb-4">Our AI is analyzing your resume and the job description...</p>
              <div className="max-w-md mx-auto bg-gray-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          ) : (
            <>
              {currentStep === 'upload' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h2>
                    <p className="text-gray-600 text-lg">
                      Upload your current resume in PDF or DOCX format to get started
                    </p>
                  </div>
                  <ResumeUploader onFileUpload={handleFileUpload} />
                </div>
              )}

              {currentStep === 'job-description' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Job Description</h2>
                    <p className="text-gray-600 text-lg">
                      Paste the job description to optimize your resume with relevant keywords
                    </p>
                  </div>
                  <JobDescriptionInput onSubmit={handleJobDescriptionSubmit} />
                </div>
              )}

              {currentStep === 'results' && results && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Optimized Documents</h2>
                    <p className="text-gray-600 text-lg">
                      Download your AI-optimized resume and personalized cover letter
                    </p>
                  </div>
                  <ResultsDisplay results={results} onStartOver={resetFlow} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Resumate. Built with AI to help you land your dream job.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}