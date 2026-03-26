FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

# Set environment variables for Python mapping and logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1

WORKDIR /app

# Copy uv dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies without installing the project yet to cache layers
RUN uv sync --frozen --no-install-project --no-dev

# Copy application code
COPY . .

# Run final sync to install anything else
RUN uv sync --frozen --no-dev

# Expose API port
EXPOSE 8000

# Start FastAPI using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]