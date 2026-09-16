from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "read_at", "created_at")
    search_fields = ("title", "body", "user__email")
    readonly_fields = ("created_at",)
