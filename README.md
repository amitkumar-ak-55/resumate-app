# Resumate

This repo has two deployable apps:

- `Frontend` - Next.js frontend
- `backend` - FastAPI backend

No Python virtual environment is required for this project.

## Local run

Backend:

```bat
cd backend
pip install -r requirements.txt
python main.py
```

Frontend:

```bat
cd Frontend
npm install
npm run dev
```

Set `Frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Vercel deploy

Deploy this repo as two Vercel projects from the same Git repository:

1. Create one Vercel project with root directory `Frontend`
2. Create another Vercel project with root directory `backend`

Set these environment variables:

Backend project:

- `GEMINI_API_KEY`
- `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`
- `LOG_TO_FILE=false`

Frontend project:

- `NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app`

This matches Vercel's monorepo flow, where each app in the repo is deployed as its own project with its own root directory.
