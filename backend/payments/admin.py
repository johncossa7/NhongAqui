from django.contrib import admin

from .models import CoinPackage, Transaction, Wallet


@admin.register(CoinPackage)
class CoinPackageAdmin(admin.ModelAdmin):
    list_display = ("name", "coins", "price_mt", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("user", "balance", "updated_at")
    search_fields = ("user__email",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("wallet", "transaction_type", "coins", "reason", "created_at")
    list_filter = ("transaction_type",)
    search_fields = ("wallet__user__email", "reason", "external_reference")
    readonly_fields = ("created_at",)
