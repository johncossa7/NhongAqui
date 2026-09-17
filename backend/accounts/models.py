from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class AccountType(models.TextChoices):
        INDIVIDUAL = "individual", "Particular"
        PROFESSIONAL = "professional", "Profissional"
        BUSINESS = "business", "Empresa"

    class VerificationStatus(models.TextChoices):
        UNVERIFIED = "unverified", "Nao verificado"
        PENDING = "pending", "Pendente"
        VERIFIED = "verified", "Verificado"
        REJECTED = "rejected", "Rejeitado"

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=80, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    avatar = models.ImageField(upload_to="accounts/avatars/", blank=True, null=True)
    province = models.CharField(max_length=80, blank=True)
    city = models.CharField(max_length=80, blank=True)
    neighborhood = models.CharField(max_length=120, blank=True)
    account_type = models.CharField(
        max_length=24,
        choices=AccountType.choices,
        default=AccountType.INDIVIDUAL,
    )
    verification_status = models.CharField(
        max_length=24,
        choices=VerificationStatus.choices,
        default=VerificationStatus.UNVERIFIED,
    )
    email_verified_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["city"]),
            models.Index(fields=["verification_status"]),
        ]

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        name = f"{self.first_name} {self.last_name}".strip()
        return name or self.email


class SellerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seller_profile")
    display_name = models.CharField(max_length=120)
    bio = models.TextField(blank=True)
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    products_sold = models.PositiveIntegerField(default=0)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["verified"]),
            models.Index(fields=["rating_average"]),
        ]

    def __str__(self) -> str:
        return self.display_name


class UserBlock(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocks_created")
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocks_received")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["blocker", "blocked"], name="unique_user_block"),
        ]
        indexes = [models.Index(fields=["blocker", "blocked"])]

    def __str__(self) -> str:
        return f"{self.blocker} bloqueou {self.blocked}"
