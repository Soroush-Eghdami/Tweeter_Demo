# =============================================================================
# Stage 1: builder — compiles wheels, needs the full toolchain + -dev headers
# =============================================================================
FROM python:3.13-alpine AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Build-time only deps: compiler + headers for psycopg/pillow/argon2/etc.
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

COPY requirements.txt /app/
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# =============================================================================
# Stage 2: runtime — only the shared libraries needed to *run* the wheels
# =============================================================================
FROM python:3.13-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    WEB_CONCURRENCY=4 \
    GUNICORN_TIMEOUT=30

WORKDIR /app

# Runtime-only shared libs (no -dev headers, no compiler)
RUN apk update && apk add --no-cache \
    curl \
    libpq \
    libffi \
    jpeg \
    zlib \
    freetype \
    lcms2 \
    openjpeg \
    tiff \
    harfbuzz \
    fribidi

# Install prebuilt wheels from the builder stage — no compilation here
COPY --from=builder /wheels /wheels
COPY requirements.txt /app/
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels

# Copy application code
COPY . /app/

# Non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser && \
    mkdir -p /app/staticfiles /app/media && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/schema/ || exit 1

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:8000 --workers ${WEB_CONCURRENCY} --timeout ${GUNICORN_TIMEOUT} core.wsgi:application"]