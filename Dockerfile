# Use official Python image
FROM python:3.11-slim

# Set work directory inside container
WORKDIR /app

# Copy backend folder to /app
COPY backend/ /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
