from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Kind(models.TextChoices):
        SYSTEM = "system", "Sistema"
        NEW_MESSAGE = "new_message", "Nova mensagem"
        PRODUCT_RESERVED = "product_reserved", "Produto reservado"
        PRODUCT_SOLD = "product_sold", "Produto vendido"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    kind = models.CharField(max_length=32, choices=Kind.choices, default=Kind.SYSTEM)
    title = models.CharField(max_length=160)
    body = models.TextField(blank=True)
    target_url = models.CharField(max_length=255, blank=True)
    data = models.JSONField(default=dict, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["user", "read_at", "created_at"]),
            models.Index(fields=["kind", "created_at"]),
        ]

    def __str__(self) -> str:
        return self.title
