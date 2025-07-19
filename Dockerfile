# Use official Python image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy backend requirements and install
COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy backend/app folder into container
COPY backend/app /app

# Expose port for FastAPI
EXPOSE 8000

# Start FastAPI with correct path
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
