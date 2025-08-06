'use client';

import { Download, FileText, Mail, RefreshCw } from 'lucide-react';
import { OptimizationResult } from '@/app/page';

interface ResultsDisplayProps {
  results: OptimizationResult;
  onStartOver: () => void;
}

export default function ResultsDisplay({ results, onStartOver }: ResultsDisplayProps) {
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Optimized Resume */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Optimized Resume</h3>
              <p className="text-sm text-gray-600">AI-enhanced with keywords</p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(results.resumeDownloadUrl, results.resumeFileName)}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Resume
          </button>
        </div>

        {/* Cover Letter */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cover Letter</h3>
              <p className="text-sm text-gray-600">Personalized for this role</p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(results.coverLetterDownloadUrl, results.coverLetterFileName)}
            className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Cover Letter
          </button>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-green-900 mb-2">✅ Optimization Complete!</h4>
        <p className="text-green-700 text-sm">
          Your resume has been optimized with relevant keywords and a personalized cover letter has been generated. 
          Both documents are ready for download in DOCX format.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onStartOver}
          className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Start Over
        </button>
        
        <button
          onClick={() => {
            handleDownload(results.resumeDownloadUrl, results.resumeFileName);
            handleDownload(results.coverLetterDownloadUrl, results.coverLetterFileName);
          }}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Both Files
        </button>
      </div>
    </div>
  );
}