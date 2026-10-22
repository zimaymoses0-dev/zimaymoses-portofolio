"""
Vercel entry point. Vercel's Python runtime looks for a WSGI callable named `app`
in this file; it's the same Django application gunicorn serves (config.wsgi, which
defaults DJANGO_SETTINGS_MODULE to production settings).
"""

import sys
from pathlib import Path

# Make the project root importable regardless of the directory Vercel runs us from.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.wsgi import application as app  # noqa: E402
