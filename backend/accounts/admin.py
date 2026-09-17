from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from reports.models import ModerationLog

from .models import SellerProfile, User, UserBlock


@admin.action(description="Marcar vendedores como verificados")
def mark_sellers_verified(modeladmin, request, queryset):
    for user in queryset:
        profile, _ = SellerProfile.objects.get_or_create(
            user=user,
            defaults={"display_name": user.full_name},
        )
        profile.verified = True
        profile.save(update_fields=["verified", "updated_at"])
        user.verification_status = User.VerificationStatus.VERIFIED
        user.save(update_fields=["verification_status", "updated_at"])
        ModerationLog.record(request.user, ModerationLog.Action.USER_VERIFIED, user)


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
        "email_verified_at",
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
        ("Estado", {"fields": ("account_type", "verification_status", "email_verified_at", "is_active")}),
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


@admin.register(UserBlock)
class UserBlockAdmin(admin.ModelAdmin):
    list_display = ("blocker", "blocked", "created_at")
    search_fields = ("blocker__email", "blocked__email")
    readonly_fields = ("created_at",)
