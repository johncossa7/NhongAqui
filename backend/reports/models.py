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


class ModerationLog(models.Model):
    class Action(models.TextChoices):
        PRODUCT_SUSPENDED = "product_suspended", "Anuncio suspenso"
        PRODUCT_REACTIVATED = "product_reactivated", "Anuncio reativado"
        PRODUCT_DELETED = "product_deleted", "Anuncio eliminado"
        IMAGE_APPROVED = "image_approved", "Imagem aprovada"
        IMAGE_REJECTED = "image_rejected", "Imagem rejeitada"
        USER_DEACTIVATED = "user_deactivated", "Conta desativada"
        USER_VERIFIED = "user_verified", "Vendedor verificado"
        REPORT_RESOLVED = "report_resolved", "Denuncia resolvida"
        REPORT_DISMISSED = "report_dismissed", "Denuncia ignorada"

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="moderation_actions",
    )
    action = models.CharField(max_length=40, choices=Action.choices)
    target_type = models.CharField(max_length=80)
    target_id = models.PositiveBigIntegerField()
    target_label = models.CharField(max_length=200)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=["action", "created_at"])]

    @classmethod
    def record(cls, actor, action, target, details=None):
        return cls.objects.create(
            actor=actor,
            action=action,
            target_type=target._meta.label_lower,
            target_id=target.pk,
            target_label=str(target)[:200],
            details=details or {},
        )


class SupportRequest(models.Model):
    class Category(models.TextChoices):
        ACCOUNT = "account", "Conta e acesso"
        LISTING = "listing", "Anuncio"
        SAFETY = "safety", "Seguranca ou fraude"
        PRIVACY = "privacy", "Privacidade e dados"
        TECHNICAL = "technical", "Problema tecnico"
        OTHER = "other", "Outro assunto"

    class Status(models.TextChoices):
        OPEN = "open", "Aberto"
        IN_PROGRESS = "in_progress", "Em tratamento"
        RESOLVED = "resolved", "Resolvido"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_requests",
    )
    name = models.CharField(max_length=120)
    email = models.EmailField()
    category = models.CharField(max_length=24, choices=Category.choices)
    subject = models.CharField(max_length=160)
    message = models.TextField(max_length=3000)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_requests_resolved",
    )

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=["status", "created_at"])]

    @property
    def reference(self) -> str:
        return f"NHA-{self.pk:06d}" if self.pk else "NHA-pendente"

    def __str__(self) -> str:
        return f"{self.reference} - {self.subject}"
