"""Dump the database to a timestamped file under BACKUP_ROOT.

Usage: python manage.py backup_db

- Postgres: shells out to `pg_dump` (must be on PATH).
- SQLite (local dev): just copies the .sqlite3 file.

Schedule this with cron / a platform's scheduled-job feature in production, e.g.:
    0 3 * * * cd /app && python manage.py backup_db
"""

import shutil
import subprocess
from datetime import datetime, timezone

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Back up the database to backups/ as a timestamped file."

    def handle(self, *args, **options):
        db = settings.DATABASES["default"]
        engine = db["ENGINE"]
        backup_root = getattr(settings, "BACKUP_ROOT", settings.BASE_DIR / "backups")
        backup_root.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")

        if "sqlite3" in engine:
            src = db["NAME"]
            dest = backup_root / f"db-{stamp}.sqlite3"
            shutil.copy2(src, dest)
        elif "postgresql" in engine:
            dest = backup_root / f"db-{stamp}.sql"
            env_args = []
            if db.get("PASSWORD"):
                import os

                os.environ["PGPASSWORD"] = db["PASSWORD"]
            cmd = [
                "pg_dump",
                "--no-owner",
                "--no-privileges",
                "-h", db.get("HOST") or "localhost",
                "-p", str(db.get("PORT") or 5432),
                "-U", db.get("USER") or "postgres",
                "-d", db["NAME"],
                "-f", str(dest),
            ]
            try:
                subprocess.run(cmd, check=True, capture_output=True, text=True)
            except FileNotFoundError as exc:
                raise CommandError(
                    "pg_dump isn't installed/on PATH. Install the postgresql-client package."
                ) from exc
            except subprocess.CalledProcessError as exc:
                raise CommandError(f"pg_dump failed: {exc.stderr}") from exc
        else:
            raise CommandError(f"No backup strategy configured for engine: {engine}")

        self.stdout.write(self.style.SUCCESS(f"Backed up database to {dest}"))
