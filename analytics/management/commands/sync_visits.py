from django.core.management.base import BaseCommand, CommandError

from analytics.sync import SyncError, sync


class Command(BaseCommand):
    help = "Importe dans la base locale les visites enregistrées sur le site en ligne (Upstash)."

    def handle(self, *args, **options):
        try:
            imported, skipped = sync()
        except SyncError as exc:
            raise CommandError(str(exc)) from exc
        message = f"{imported} visite(s) importée(s)."
        if skipped:
            message += f" {skipped} enregistrement(s) illisible(s) ignoré(s)."
        self.stdout.write(self.style.SUCCESS(message))
