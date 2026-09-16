from django.conf import settings
from django.db import models


class Report(models.Model):
    class Reason(models.TextChoices):
        FRAUD = "fraud", "Fraude"
        FAKE_PRODUCT = "fake_product", "Produto falso"
        MISLEADING = "misleading", "Enganoso"
        INAPPROPRIATE = "inappropriate", "Inapropriado"
        PROHIBITED = "prohibited", "Proibido"
        SPAM = "spam", "Spam"
        OTHER = "other", "Outro"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        RESOLVED = "resolved", "Resolvida"
        DISMISSED = "dismissed", "Ignorada"

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="reports")
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports_received",
    )
    reason = models.CharField(max_length=32, choices=Reason.choices)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports_resolved",
    )

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=["status", "created_at"])]

    def __str__(self) -> str:
        return f"{self.reason} - {self.product}"
