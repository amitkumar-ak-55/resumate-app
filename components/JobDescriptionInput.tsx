'use client';

import { useState } from 'react';
import { ArrowRight, Briefcase } from 'lucide-react';

interface JobDescriptionInputProps {
  onSubmit: (jobDescription: string) => void;
}

export default function JobDescriptionInput({ onSubmit }: JobDescriptionInputProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }
    
    if (jobDescription.trim().length < 100) {
      setError('Please provide a more detailed job description (at least 100 characters).');
      return;
    }

    setError('');
    onSubmit(jobDescription.trim());
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="job-description" className="flex items-center text-lg font-medium text-gray-900 mb-4">
            <Briefcase className="w-5 h-5 mr-2" />
            Job Description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here. Include the job title, required skills, qualifications, and responsibilities. The more detailed the description, the better we can optimize your resume..."
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${jobDescription.length < 100 ? 'text-red-500' : 'text-gray-500'}`}>
              {jobDescription.length} characters (minimum 100 required)
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!jobDescription.trim() || jobDescription.length < 100}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Optimize Resume
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>

      {/* Example Job Description */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tip: Include these details for best results</h4>
        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
          <li>Job title and company name</li>
          <li>Required technical skills and technologies</li>
          <li>Years of experience needed</li>
          <li>Educational requirements</li>
          <li>Key responsibilities and duties</li>
          <li>Preferred qualifications or certifications</li>
        </ul>
      </div>
    </div>
  );
}