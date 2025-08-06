# Resumate - AI-Powered Resume Optimization Tool

Resumate is a production-ready web application that uses AI to optimize resumes based on job descriptions. Users can upload their resume (PDF/DOCX), paste a job description, and receive an AI-optimized resume plus a personalized cover letter.

## Features

- 🤖 **AI-Powered Optimization**: Uses OpenAI GPT-4 to optimize resumes with ATS keywords
- 📄 **Multi-Format Support**: Handles PDF and DOCX resume uploads
- 📝 **Auto Cover Letter Generation**: Creates personalized cover letters for each job
- 💾 **Downloadable Results**: Provides DOCX files for both optimized resume and cover letter
- 📱 **Mobile Responsive**: Works seamlessly across all device types
- 🚀 **No Registration Required**: Simple, one-time use tool

## Tech Stack

### Frontend
- Next.js 13+ with React and TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Responsive design with modern UI/UX

### Backend
- FastAPI with Python
- OpenAI GPT-4 API integration
- PyMuPDF for PDF parsing
- python-docx for DOCX handling
- File generation and download system

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- OpenAI API key

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend URL:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Update `.env` with your OpenAI API key:
```bash
OPENAI_API_KEY=your_openai_api_key_here
BASE_URL=http://localhost:8000
```

6. Start the backend server:
```bash
python main.py
```

The backend API will be available at `http://localhost:8000`

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
3. Deploy automatically on push to main branch

### Backend (Render)

1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration
3. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `BASE_URL`: Your Render service URL

Alternative deployment options:
- **Railway**: Use the Dockerfile for containerized deployment
- **Heroku**: Add Procfile: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

## API Documentation

### POST /optimize-resume
Optimizes a resume based on job description.

**Request:**
- `resume_file`: PDF or DOCX file (multipart/form-data)
- `job_description`: Text description of the target job (form field)

**Response:**
```json
{
  "resumeFileName": "Optimized_Resume.docx",
  "resumeDownloadUrl": "https://api.example.com/download/Optimized_Resume.docx",
  "coverLetterFileName": "Cover_Letter.docx", 
  "coverLetterDownloadUrl": "https://api.example.com/download/Cover_Letter.docx"
}
```

### GET /download/{filename}
Downloads generated DOCX files.

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=your_backend_url
```

### Backend (.env)
```bash
OPENAI_API_KEY=your_openai_api_key
BASE_URL=your_backend_url
```

## File Structure

```
resumate/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ResumeUploader.tsx
│   ├── JobDescriptionInput.tsx
│   └── ResultsDisplay.tsx
├── backend/               # FastAPI backend
│   ├── main.py           # FastAPI application
│   ├── services/         # Business logic
│   │   ├── file_parser.py
│   │   ├── ai_service.py
│   │   └── docx_generator.py
│   ├── requirements.txt
│   └── Dockerfile
└── README.md
```

## How It Works

1. **File Upload**: User uploads their resume (PDF/DOCX)
2. **Content Extraction**: Backend parses the resume using PyMuPDF or python-docx
3. **Job Analysis**: AI analyzes job description to extract key requirements and keywords
4. **Resume Optimization**: AI rewrites resume content to include relevant keywords naturally
5. **Cover Letter Generation**: AI creates a personalized cover letter for the position
6. **Document Creation**: Backend generates professional DOCX files
7. **Download**: User receives optimized resume and cover letter

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
1. Check the GitHub Issues
2. Create a new issue with detailed description
3. Include error logs and environment details

## Security Notes

- API keys are never exposed to the frontend
- Uploaded files are temporarily stored and automatically cleaned
- No user data is permanently stored
- CORS is configured for production security