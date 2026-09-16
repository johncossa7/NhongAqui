from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Product(models.Model):
    class Condition(models.TextChoices):
        NEW = "new", "Novo"
        LIKE_NEW = "like_new", "Como novo"
        GOOD = "good", "Bom estado"
        USED = "used", "Usado"
        PARTS = "parts", "Para pecas"

    class Status(models.TextChoices):
        DRAFT = "draft", "Rascunho"
        PENDING_REVIEW = "pending_review", "Em analise"
        ACTIVE = "active", "Ativo"
        RESERVED = "reserved", "Reservado"
        SOLD = "sold", "Vendido"
        SUSPENDED = "suspended", "Suspenso"
        DELETED = "deleted", "Eliminado"

    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
    category = models.ForeignKey("categories.Category", on_delete=models.PROTECT, related_name="products")
    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    negotiable = models.BooleanField(default=True)
    condition = models.CharField(max_length=24, choices=Condition.choices)
    province = models.CharField(max_length=80)
    city = models.CharField(max_length=80)
    neighborhood = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.ACTIVE)
    featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    sold_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-featured", "-published_at", "-created_at")
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["featured", "status"]),
            models.Index(fields=["city", "status"]),
            models.Index(fields=["category", "status"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "produto"
            slug = base
            counter = 2
            while type(self).objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        if self.status == self.Status.ACTIVE and not self.published_at:
            self.published_at = timezone.now()
        if self.status == self.Status.SOLD and not self.sold_at:
            self.sold_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class ProductImage(models.Model):
    class ModerationStatus(models.TextChoices):
        PENDING = "pending", "Pendente"
        APPROVED = "approved", "Aprovada"
        REVIEW_REQUIRED = "review_required", "Revisao necessaria"
        REJECTED = "rejected", "Rejeitada"

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/%Y/%m/")
    position = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    moderation_status = models.CharField(
        max_length=24,
        choices=ModerationStatus.choices,
        default=ModerationStatus.PENDING,
    )
    moderation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("position", "id")
        indexes = [
            models.Index(fields=["product", "position"]),
            models.Index(fields=["moderation_status"]),
        ]

    def __str__(self) -> str:
        return f"{self.product} #{self.position}"
