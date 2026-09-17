from django.contrib import admin
from django.utils import timezone

from reports.models import ModerationLog

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    readonly_fields = ("created_at",)


@admin.action(description="Suspender anuncios selecionados")
def suspend_products(modeladmin, request, queryset):
    for product in queryset:
        product.status = Product.Status.SUSPENDED
        product.save(update_fields=["status", "updated_at"])
        ModerationLog.record(request.user, ModerationLog.Action.PRODUCT_SUSPENDED, product)


@admin.action(description="Reativar anuncios selecionados")
def activate_products(modeladmin, request, queryset):
    for product in queryset:
        product.status = Product.Status.ACTIVE
        product.published_at = product.published_at or timezone.now()
        product.save(update_fields=["status", "published_at", "updated_at"])
        ModerationLog.record(request.user, ModerationLog.Action.PRODUCT_REACTIVATED, product)


@admin.action(description="Destacar anuncios selecionados")
def feature_products(modeladmin, request, queryset):
    queryset.update(featured=True)


@admin.action(description="Aprovar imagens selecionadas")
def approve_images(modeladmin, request, queryset):
    for image in queryset:
        image.moderation_status = ProductImage.ModerationStatus.APPROVED
        image.moderation_reason = ""
        image.save(update_fields=["moderation_status", "moderation_reason"])
        ModerationLog.record(request.user, ModerationLog.Action.IMAGE_APPROVED, image)


@admin.action(description="Rejeitar imagens selecionadas")
def reject_images(modeladmin, request, queryset):
    for image in queryset:
        image.moderation_status = ProductImage.ModerationStatus.REJECTED
        image.moderation_reason = "Rejeitada pelo administrador."
        image.save(update_fields=["moderation_status", "moderation_reason"])
        ModerationLog.record(request.user, ModerationLog.Action.IMAGE_REJECTED, image)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "seller",
        "category",
        "price",
        "condition",
        "status",
        "featured",
        "city",
        "created_at",
    )
    list_filter = ("status", "condition", "featured", "city", "category")
    search_fields = ("title", "description", "seller__email", "seller__phone")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("views_count", "created_at", "updated_at", "published_at", "sold_at")
    actions = [suspend_products, activate_products, feature_products]
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "position", "is_primary", "moderation_status", "created_at")
    list_filter = ("is_primary", "moderation_status")
    search_fields = ("product__title",)
    readonly_fields = ("created_at",)
    actions = [approve_images, reject_images]
