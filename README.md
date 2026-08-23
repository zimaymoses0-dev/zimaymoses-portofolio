# Portfolio (Django rebuild)

A premium, editorial portfolio site built with Django 5, styled after the
visual language and rhythm of `surinder.design` — original content and
service offerings, not a clone of that site's business or copy.

> The previous React/Express/Supabase implementation ("MZ Creative Room")
> lives untouched in `_legacy_mz_creative_room/` for reference/recovery.

## Status

This is **phase 1 of a multi-phase build**: the Home page is fully working
end-to-end (models → admin → templates → styling → interactions), on top
of a real Django project skeleton (settings split, Docker, Celery wiring).
Work / Process / Pricing / About / Ask / Certifications detail pages,
the ROI calculator, leads, and the ROI/ask/legal pages are not built yet —
their apps and routes are scaffolded for but not implemented. Header nav
links to those pages currently point at Home as a placeholder.

## Stack

- Python 3.12 (Docker) / this environment was set up against the locally
  installed Python 3.10 — Django 5 supports both.
- Django 5, PostgreSQL (SQLite locally by default), Redis + Celery, Pillow
- Django Templates + vanilla CSS (design tokens) + Alpine.js for light
  interactivity. No GSAP was needed for Home — CSS transitions +
  IntersectionObserver cover the reveal/parallax requirements.
- WhiteNoise for static files, Gunicorn for production serving.

## Local setup (no Docker)

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

copy .env.example .env          # Windows
# cp .env.example .env          # macOS/Linux
# edit .env — at minimum set a real SECRET_KEY

python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo      # populates clearly-marked [DEMO] content
python manage.py runserver
```

Visit `http://localhost:8000/` for the site and `http://localhost:8000/admin/`
for the CMS.

## Docker

```bash
docker compose up --build
```

This starts Postgres, Redis, the Django app (Gunicorn), and a Celery
worker. Run migrations/seed inside the container the first time:

```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py seed_demo
```

(Not live-tested in this environment — Docker Desktop's daemon wasn't
running here. Verify the compose stack on a machine with Docker running
before relying on it.)

## Tests

```bash
python manage.py test
```

12 tests cover the SiteSettings singleton, PageContent uniqueness, Home
view rendering (published/featured-only filtering), and the newsletter
subscribe endpoint (valid/invalid email, duplicates, reactivation).

## Content management (Django Admin)

Everything on Home is admin-editable, nothing is hardcoded business data:

- **Site settings** (`/admin/core/sitesettings/`) — singleton: name, headline,
  contact info, booking URL, socials, footer text.
- **Page content blocks** (`/admin/core/pagecontent/`) — the hero/how-i-help/
  behavior/case-studies/cta copy on Home. Each block is keyed by
  `(page, section_key)` — the template looks up specific keys (`hero`,
  `how-i-help`, `behavior`, `case-studies`, `cta`), so use those exact keys.
- **Metrics** (`/admin/core/metric/`) — the 3 credibility stats.
- **Services** (`/admin/services/service/`) — the "How I help" cards
  (name, price, currency, duration, badge, CTA).
- **Case studies** (`/admin/portfolio/casestudy/`) — only `published=True`
  rows show on Home.
- **Testimonials** (`/admin/testimonials/testimonial/`) — only
  `is_published=True, featured=True` rows show on Home (max 3).
- **Video testimonials** (`/admin/testimonials/videotestimonial/`).
- **Certifications** (`/admin/certifications/certification/`) — the
  carousel; `dark_card` toggles the dark card variant.
- **Newsletter subscribers** (`/admin/newsletter/subscriber/`) — read-only
  view of who subscribed via the Home form.

If a model has no published rows, its Home section hides itself entirely
(no empty grids/cards shown to visitors).

## Known gaps / next steps

- Work, Process, Pricing, About, Ask, Certifications-detail, Privacy,
  Terms, Payment Terms, 404, 500 pages are not built yet.
- The ROI calculator, leads system, and email/Celery tasks aren't built —
  `config/celery.py` is wired up but there are no tasks yet.
- i18n (FR/EN) not set up.
- SEO extras (sitemap.xml, robots.txt, JSON-LD) not added yet.
- No production secrets are set — `SECRET_KEY` in `.env` is a locally
  generated dev value; generate a fresh one for any real deployment.
