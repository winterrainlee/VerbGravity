# Stage 1: Build React frontend
FROM node:20-slim AS build-frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup FastAPI backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# Copy built frontend from Stage 1
# This matches the "static" directory checked in server/main.py
COPY --from=build-frontend /app/client/dist ./static

# Copy backend code
COPY server/ ./

# Create data directory for SQLite
RUN mkdir -p data

# Environment variables
ENV VG_DB_PATH=/app/data/verbgravity.db
ENV PORT=8080
ENV VG_ADMIN_PW=admin

EXPOSE 8080

# Run the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
