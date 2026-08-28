FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# collectstatic only needs settings to *load*, not a real secret or a live database —
# but production.py now refuses to boot with the insecure default SECRET_KEY, and the
# platform's real one isn't available at build time (only at container runtime). This
# placeholder satisfies that check for the build step only; Railway's actual SECRET_KEY
# env var overrides it once the container starts. No `|| true` here on purpose: if
# collectstatic genuinely fails, the build should fail loudly instead of shipping an
# image with no static files.
RUN SECRET_KEY=build-time-placeholder-not-used-at-runtime \
    python manage.py collectstatic --noinput --settings=config.settings.production

EXPOSE 8000

# Migrations run at container start (not build time), since the real DATABASE_URL only
# exists at runtime on platforms like Railway. Then shell-form CMD so $PORT actually
# expands — Railway/Render/Heroku-style platforms inject it at runtime and expect the
# app to bind there; ${PORT:-8000} falls back to 8000 for plain `docker run` / compose.
CMD python manage.py migrate --noinput && \
    gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3
