from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.services import delete_user_account
from reports.models import SupportRequest

User = get_user_model()

DEMO_EMAILS = [
    "comprador@nhongaqui.local",
    "vendedor1@nhongaqui.local",
    "vendedor2@nhongaqui.local",
    "vendedor3@nhongaqui.local",
    "vendedor4@nhongaqui.local",
]


class Command(BaseCommand):
    help = "Remove the known demo accounts and all data owned by them."

    def handle(self, *args, **options):
        SupportRequest.objects.filter(email__in=DEMO_EMAILS).delete()
        users = list(User.objects.filter(email__in=DEMO_EMAILS))
        for user in users:
            delete_user_account(user)

        if users:
            self.stdout.write(self.style.SUCCESS(f"Removed {len(users)} demo account(s)."))
        else:
            self.stdout.write("No demo accounts found.")
