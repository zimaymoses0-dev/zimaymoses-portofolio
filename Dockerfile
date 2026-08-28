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

RUN python manage.py collectstatic --noinput --settings=config.settings.production || true

EXPOSE 8000

# Shell form (not exec form) so $PORT actually expands. Railway/Render/Heroku-style
# platforms inject PORT at runtime and expect the app to bind to it; ${PORT:-8000}
# falls back to 8000 for plain `docker run` / docker-compose where it isn't set.
CMD gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3
