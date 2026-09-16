from django.conf import settings
from django.db import models


class VerificationRequest(models.Model):
    class DocumentType(models.TextChoices):
        BI = "bi", "BI"
        PASSPORT = "passport", "Passaporte"
        DIRE = "dire", "DIRE"
        OTHER = "other", "Outro"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        APPROVED = "approved", "Aprovada"
        REJECTED = "rejected", "Rejeitada"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="verification_requests",
    )
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=40)
    nuit = models.CharField(max_length=40, blank=True)
    document_type = models.CharField(max_length=24, choices=DocumentType.choices)
    document_number = models.CharField(max_length=80)
    document_front = models.FileField(upload_to="verification/private/", blank=True, null=True)
    document_back = models.FileField(upload_to="verification/private/", blank=True, null=True)
    selfie = models.FileField(upload_to="verification/private/", blank=True, null=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verification_reviews",
    )
    rejection_reason = models.TextField(blank=True)

    class Meta:
        ordering = ("-submitted_at",)
        indexes = [models.Index(fields=["status", "submitted_at"])]

    def __str__(self) -> str:
        return f"{self.full_name} - {self.status}"
