import './globals.css';

export const metadata = {
  title: 'Resumate - AI Resume Optimizer',
  description: 'AI-powered resume optimization and cover letter generation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
