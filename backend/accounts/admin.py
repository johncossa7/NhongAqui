from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import SellerProfile, User


@admin.action(description="Marcar vendedores como verificados")
def mark_sellers_verified(modeladmin, request, queryset):
    for user in queryset:
        SellerProfile.objects.update_or_create(
            user=user,
            defaults={"display_name": user.full_name, "verified": True},
        )
    queryset.update(verification_status=User.VerificationStatus.VERIFIED)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("email",)
    list_display = (
        "email",
        "first_name",
        "last_name",
        "phone",
        "city",
        "account_type",
        "verification_status",
        "is_staff",
        "is_active",
    )
    list_filter = ("account_type", "verification_status", "is_staff", "is_active", "city")
    search_fields = ("email", "first_name", "last_name", "phone", "city")
    readonly_fields = ("date_joined", "created_at", "updated_at")
    actions = [mark_sellers_verified]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Dados pessoais", {"fields": ("first_name", "last_name", "phone", "avatar")}),
        ("Localizacao", {"fields": ("province", "city", "neighborhood")}),
        ("Estado", {"fields": ("account_type", "verification_status", "is_active")}),
        ("Permissoes", {"fields": ("is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Datas", {"fields": ("date_joined", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "user",
        "verified",
        "rating_average",
        "rating_count",
        "products_sold",
    )
    list_filter = ("verified",)
    search_fields = ("display_name", "user__email", "user__phone")
    readonly_fields = ("created_at", "updated_at")
