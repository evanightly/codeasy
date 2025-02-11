FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY fastapi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install and setup Jupyter kernel
RUN python -m ipykernel install --name=python3

COPY fastapi .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]