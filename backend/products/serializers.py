from django.conf import settings
from django.db import transaction
from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from categories.models import Category
from categories.serializers import CategorySerializer
from common.moderation import MockImageModerationService

from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "position",
            "is_primary",
            "moderation_status",
            "moderation_reason",
            "created_at",
        ]
        read_only_fields = ["id", "moderation_status", "moderation_reason", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    seller = PublicUserSerializer(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.filter(is_active=True))
    category_detail = CategorySerializer(source="category", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        max_length=settings.MAX_PRODUCT_IMAGES,
    )
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "seller",
            "category",
            "category_detail",
            "title",
            "slug",
            "description",
            "price",
            "negotiable",
            "condition",
            "province",
            "city",
            "neighborhood",
            "status",
            "featured",
            "views_count",
            "images",
            "uploaded_images",
            "is_favorited",
            "created_at",
            "updated_at",
            "published_at",
            "sold_at",
        ]
        read_only_fields = [
            "id",
            "seller",
            "slug",
            "status",
            "featured",
            "views_count",
            "is_favorited",
            "created_at",
            "updated_at",
            "published_at",
            "sold_at",
        ]

    def get_is_favorited(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.favorites.filter(user=request.user).exists()

    def validate_uploaded_images(self, value):
        if len(value) > settings.MAX_PRODUCT_IMAGES:
            raise serializers.ValidationError(f"Maximo de {settings.MAX_PRODUCT_IMAGES} imagens.")
        if self.instance and self.instance.images.count() + len(value) > settings.MAX_PRODUCT_IMAGES:
            available = settings.MAX_PRODUCT_IMAGES - self.instance.images.count()
            raise serializers.ValidationError(f"Pode adicionar mais {max(available, 0)} imagens.")
        return value

    def _save_images(self, product, uploaded_images, start_position=0):
        moderation = MockImageModerationService()
        for offset, image in enumerate(uploaded_images[: settings.MAX_PRODUCT_IMAGES]):
            result = moderation.moderate(image)
            position = start_position + offset
            ProductImage.objects.create(
                product=product,
                image=image,
                position=position,
                is_primary=position == 0 and not product.images.exists(),
                moderation_status=result.status,
                moderation_reason=result.reason,
            )

    @transaction.atomic
    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        request = self.context.get("request")
        if request:
            uploaded_images = uploaded_images or request.FILES.getlist("uploaded_images")
        product = Product.objects.create(**validated_data)
        self._save_images(product, uploaded_images)
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        request = self.context.get("request")
        if request:
            uploaded_images = uploaded_images or request.FILES.getlist("uploaded_images")
        if instance.images.count() + len(uploaded_images) > settings.MAX_PRODUCT_IMAGES:
            available = settings.MAX_PRODUCT_IMAGES - instance.images.count()
            raise serializers.ValidationError({"uploaded_images": f"Pode adicionar mais {max(available, 0)} imagens."})
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        next_position = instance.images.count()
        self._save_images(instance, uploaded_images, start_position=next_position)
        return instance


class ProductSummarySerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "title", "slug", "price", "city", "status", "primary_image"]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not image:
            return None
        request = self.context.get("request")
        url = image.image.url
        return request.build_absolute_uri(url) if request else url
