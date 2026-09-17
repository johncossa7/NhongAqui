from django.contrib import admin
from django.utils import timezone

from accounts.models import SellerProfile, User
from reports.models import ModerationLog

from .models import VerificationRequest


@admin.action(description="Aprovar verificacoes")
def approve_verifications(modeladmin, request, queryset):
    for verification in queryset.select_related("user"):
        verification.status = VerificationRequest.Status.APPROVED
        verification.reviewed_at = timezone.now()
        verification.reviewed_by = request.user
        verification.save(update_fields=["status", "reviewed_at", "reviewed_by"])
        verification.user.verification_status = User.VerificationStatus.VERIFIED
        verification.user.save(update_fields=["verification_status", "updated_at"])
        profile, _ = SellerProfile.objects.get_or_create(
            user=verification.user,
            defaults={"display_name": verification.user.full_name},
        )
        profile.verified = True
        profile.save(update_fields=["verified", "updated_at"])
        ModerationLog.record(request.user, ModerationLog.Action.USER_VERIFIED, verification.user)


@admin.action(description="Rejeitar verificacoes")
def reject_verifications(modeladmin, request, queryset):
    for verification in queryset.select_related("user"):
        verification.status = VerificationRequest.Status.REJECTED
        verification.reviewed_at = timezone.now()
        verification.reviewed_by = request.user
        verification.save(update_fields=["status", "reviewed_at", "reviewed_by"])
        verification.user.verification_status = User.VerificationStatus.REJECTED
        verification.user.save(update_fields=["verification_status", "updated_at"])
        SellerProfile.objects.filter(user=verification.user).update(verified=False)


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "phone", "document_type", "status", "submitted_at")
    list_filter = ("status", "document_type")
    search_fields = ("full_name", "phone", "nuit", "document_number", "user__email")
    readonly_fields = ("submitted_at", "reviewed_at", "reviewed_by")
    actions = [approve_verifications, reject_verifications]

    def has_view_or_change_permission(self, request, obj=None):
        return request.user.is_staff
