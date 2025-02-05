# docker/fastapi.Dockerfile

FROM python:3.10-slim

WORKDIR /app

COPY fastapi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY fastapi/ /app

# Expose port
EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
