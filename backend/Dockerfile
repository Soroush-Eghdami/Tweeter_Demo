FROM python:3.13-alpine

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Replace default Alpine repositories with a working Iranian mirror (Alpine v3.23)
RUN echo "https://mirror.arvancloud.ir/alpine/v3.23/main" > /etc/apk/repositories \
    && echo "https://mirror.arvancloud.ir/alpine/v3.23/community" >> /etc/apk/repositories

# Install system dependencies
RUN apk update && apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    libffi-dev \
    jpeg-dev \
    zlib-dev \
    freetype-dev \
    lcms2-dev \
    openjpeg-dev \
    tiff-dev \
    tk-dev \
    tcl-dev \
    harfbuzz-dev \
    fribidi-dev

# Copy requirements first (for better caching)
COPY requirements.txt /app/

# Use a reliable Iranian PyPI mirror
# CHANGE THIS LINE TO A WORKING MIRROR
ARG PYPI_MIRROR=https://mirror-pypi.runflare.com/simple

# Install Python dependencies
RUN pip install --no-cache-dir -i ${PYPI_MIRROR} -r requirements.txt

# Copy the rest of the project
COPY . /app/

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser && \
    chown -R appuser:appgroup /app

# Create static and media directories
RUN mkdir -p /app/staticfiles /app/media && \
    chown -R appuser:appgroup /app/staticfiles /app/media

USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]