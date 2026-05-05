#!/bin/bash
echo "🚀 Starting Resumate Backend..."

# Stop existing container if running
docker stop resumate-backend 2>/dev/null || true
docker rm resumate-backend 2>/dev/null || true

# Run the container
docker run -d \
  --name resumate-backend \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/temp_files:/app/temp_files \
  --restart unless-stopped \
  resumate-backend:latest

echo "✅ Resumate Backend is running!"
echo "📍 API available at: http://localhost:8000"
echo "🏥 Health check: http://localhost:8000/health"
echo "📋 Logs: docker logs -f resumate-backend"
