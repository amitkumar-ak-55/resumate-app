#!/bin/bash
echo "🛑 Stopping Resumate Backend..."

docker stop resumate-backend
docker rm resumate-backend

echo "✅ Resumate Backend stopped!"
