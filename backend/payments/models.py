from django.conf import settings
from django.db import models


class CoinPackage(models.Model):
    name = models.CharField(max_length=120)
    coins = models.PositiveIntegerField()
    price_mt = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.coins})"


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Wallet {self.user}"


class Transaction(models.Model):
    class Type(models.TextChoices):
        CREDIT = "credit", "Credito"
        DEBIT = "debit", "Debito"

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=16, choices=Type.choices)
    coins = models.PositiveIntegerField()
    reason = models.CharField(max_length=160)
    external_reference = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"{self.transaction_type} {self.coins}"
