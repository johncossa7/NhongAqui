from django.contrib import admin
from django.utils import timezone

from accounts.models import User

from .models import VerificationRequest


@admin.action(description="Aprovar verificacoes")
def approve_verifications(modeladmin, request, queryset):
    queryset.update(status=VerificationRequest.Status.APPROVED, reviewed_at=timezone.now(), reviewed_by=request.user)
    User.objects.filter(id__in=queryset.values("user_id")).update(verification_status=User.VerificationStatus.VERIFIED)


@admin.action(description="Rejeitar verificacoes")
def reject_verifications(modeladmin, request, queryset):
    queryset.update(status=VerificationRequest.Status.REJECTED, reviewed_at=timezone.now(), reviewed_by=request.user)
    User.objects.filter(id__in=queryset.values("user_id")).update(verification_status=User.VerificationStatus.REJECTED)


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "phone", "document_type", "status", "submitted_at")
    list_filter = ("status", "document_type")
    search_fields = ("full_name", "phone", "nuit", "document_number", "user__email")
    readonly_fields = ("submitted_at", "reviewed_at", "reviewed_by")
    actions = [approve_verifications, reject_verifications]

    def has_view_or_change_permission(self, request, obj=None):
        return request.user.is_staff
