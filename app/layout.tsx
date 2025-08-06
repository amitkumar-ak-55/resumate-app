import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resumate - AI-Powered Resume Optimization',
  description: 'Transform your resume with AI to match any job description. Get optimized resumes and personalized cover letters in minutes.',
  keywords: 'resume optimization, AI resume, cover letter generator, job application, ATS keywords',
  authors: [{ name: 'Resumate Team' }],
  openGraph: {
    title: 'Resumate - AI-Powered Resume Optimization',
    description: 'Transform your resume with AI to match any job description.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}