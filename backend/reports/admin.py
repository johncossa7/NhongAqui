from django.contrib import admin
from django.utils import timezone

from .models import ModerationLog, Report, SupportRequest


@admin.action(description="Marcar denuncias como resolvidas")
def mark_resolved(modeladmin, request, queryset):
    queryset.update(status=Report.Status.RESOLVED, resolved_at=timezone.now(), resolved_by=request.user)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("product", "reporter", "reported_user", "reason", "status", "created_at")
    list_filter = ("status", "reason")
    search_fields = ("product__title", "reporter__email", "reported_user__email", "description")
    readonly_fields = ("created_at", "resolved_at")
    actions = [mark_resolved]


@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ("action", "target_label", "actor", "created_at")
    list_filter = ("action", "target_type")
    search_fields = ("target_label", "actor__email")
    readonly_fields = ("actor", "action", "target_type", "target_id", "target_label", "details", "created_at")

    def has_add_permission(self, request):
        return False


@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = ("reference", "subject", "category", "email", "status", "created_at")
    list_filter = ("status", "category")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("user", "name", "email", "category", "subject", "message", "created_at", "updated_at")

    @admin.display(description="Referencia")
    def reference(self, obj):
        return obj.reference
