from django.contrib import admin
from django.utils import timezone

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    readonly_fields = ("created_at",)


@admin.action(description="Suspender anuncios selecionados")
def suspend_products(modeladmin, request, queryset):
    queryset.update(status=Product.Status.SUSPENDED)


@admin.action(description="Reativar anuncios selecionados")
def activate_products(modeladmin, request, queryset):
    queryset.update(status=Product.Status.ACTIVE, published_at=timezone.now())


@admin.action(description="Destacar anuncios selecionados")
def feature_products(modeladmin, request, queryset):
    queryset.update(featured=True)


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
