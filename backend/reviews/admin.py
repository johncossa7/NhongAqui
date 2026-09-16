from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("reviewer", "reviewed_user", "product", "rating", "created_at")
    list_filter = ("rating",)
    search_fields = ("reviewer__email", "reviewed_user__email", "product__title", "comment")
    readonly_fields = ("created_at",)
