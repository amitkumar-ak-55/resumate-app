#!/bin/bash
echo "🐳 Building Resumate Backend Docker Image..."

# Build the Docker image
docker build -t resumate-backend:latest .

echo "✅ Build completed!"
echo "🚀 To run: ./run.sh"
