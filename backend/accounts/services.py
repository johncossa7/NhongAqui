import logging

from django.db import transaction

from products.models import ProductImage
from verification.models import VerificationRequest

logger = logging.getLogger(__name__)


def _stored_files_for_user(user):
    files = []

    def remember(field_file):
        if field_file and field_file.name:
            files.append((field_file.storage, field_file.name))

    remember(user.avatar)
    for image in ProductImage.objects.filter(product__seller=user).only("image"):
        remember(image.image)
    for verification in VerificationRequest.objects.filter(user=user).only(
        "document_front",
        "document_back",
        "selfie",
    ):
        remember(verification.document_front)
        remember(verification.document_back)
        remember(verification.selfie)

    return list({(id(storage), name): (storage, name) for storage, name in files}.values())


def delete_user_account(user):
    stored_files = _stored_files_for_user(user)

    with transaction.atomic():
        user.delete()
        transaction.on_commit(lambda: _delete_stored_files(stored_files))


def _delete_stored_files(stored_files):
    for storage, name in stored_files:
        try:
            storage.delete(name)
        except Exception:
            logger.exception("Could not delete account file from storage: %s", name)
