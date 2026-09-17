from django.conf import settings
from django.db import transaction
from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from categories.models import Category
from categories.serializers import CategorySerializer

from .images import prepare_product_image
from .models import Product, ProductImage


def absolute_file_url(request, url: str) -> str:
    if not request or url.startswith(("http://", "https://")):
        return url
    if not url.startswith("/"):
        url = f"/{url}"
    return request.build_absolute_uri(url)


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

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
        read_only_fields = ["id", "image", "moderation_status", "moderation_reason", "created_at"]

    def get_image(self, obj):
        request = self.context.get("request")
        url = obj.image.url
        return absolute_file_url(request, url)


class ProductSerializer(serializers.ModelSerializer):
    seller = PublicUserSerializer(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.filter(is_active=True))
    category_detail = CategorySerializer(source="category", read_only=True)
    images = serializers.SerializerMethodField()
    delete_image_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
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
            "delete_image_ids",
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

    def _visible_images(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and (user.is_staff or user.pk == obj.seller_id):
            return obj.images.all()
        return obj.images.filter(moderation_status=ProductImage.ModerationStatus.APPROVED)

    def get_images(self, obj):
        return ProductImageSerializer(
            self._visible_images(obj),
            many=True,
            context=self.context,
        ).data

    def validate_uploaded_images(self, value):
        if len(value) > settings.MAX_PRODUCT_IMAGES:
            raise serializers.ValidationError(f"Maximo de {settings.MAX_PRODUCT_IMAGES} imagens.")
        if self.instance and self.instance.images.count() + len(value) > settings.MAX_PRODUCT_IMAGES:
            delete_ids = self._delete_image_ids()
            delete_count = self.instance.images.filter(id__in=delete_ids).count()
            available = settings.MAX_PRODUCT_IMAGES - (self.instance.images.count() - delete_count)
            if len(value) > available:
                raise serializers.ValidationError(f"Pode adicionar mais {max(available, 0)} imagens.")
        return [prepare_product_image(image) for image in value]

    def validate(self, attrs):
        uploaded_images = attrs.get("uploaded_images", [])
        delete_ids = self._delete_image_ids()
        if self.instance:
            delete_count = self.instance.images.filter(id__in=delete_ids).count()
            final_count = self.instance.images.count() - delete_count + len(uploaded_images)
            if delete_ids and final_count < 1:
                raise serializers.ValidationError({"delete_image_ids": "O anuncio deve manter pelo menos uma fotografia."})
        elif not uploaded_images:
            raise serializers.ValidationError({"uploaded_images": "Adicione pelo menos uma fotografia do produto."})
        return attrs

    def _delete_image_ids(self):
        data = getattr(self, "initial_data", {}) or {}
        raw_values = []

        def add_values(value):
            if isinstance(value, (list, tuple)):
                raw_values.extend(value)
            else:
                raw_values.append(value)

        if hasattr(data, "getlist"):
            raw_values.extend(data.getlist("delete_image_ids"))
            raw_values.extend(data.getlist("delete_image_ids[]"))
            if hasattr(data, "lists"):
                for key, values in data.lists():
                    if key.startswith("delete_image_ids["):
                        raw_values.extend(values)
        else:
            value = data.get("delete_image_ids", [])
            add_values(value)
            for key, value in data.items():
                if key.startswith("delete_image_ids["):
                    add_values(value)

        image_ids = []
        for value in raw_values:
            if value in ("", None):
                continue
            try:
                image_ids.append(int(value))
            except (TypeError, ValueError):
                raise serializers.ValidationError({"delete_image_ids": "Imagem invalida."})
        return image_ids

    def _save_images(self, product, uploaded_images, start_position=0):
        for offset, image in enumerate(uploaded_images[: settings.MAX_PRODUCT_IMAGES]):
            position = start_position + offset
            ProductImage.objects.create(
                product=product,
                image=image,
                position=position,
                is_primary=position == 0 and not product.images.exists(),
                moderation_status=ProductImage.ModerationStatus.PENDING,
                moderation_reason="",
            )

    def _normalize_images(self, product):
        for position, image in enumerate(product.images.order_by("position", "id")):
            update_fields = []
            if image.position != position:
                image.position = position
                update_fields.append("position")
            should_be_primary = position == 0
            if image.is_primary != should_be_primary:
                image.is_primary = should_be_primary
                update_fields.append("is_primary")
            if update_fields:
                image.save(update_fields=update_fields)

    def _clear_images_cache(self, product):
        if hasattr(product, "_prefetched_objects_cache"):
            product._prefetched_objects_cache.pop("images", None)

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
        delete_image_ids = validated_data.pop("delete_image_ids", None)
        request = self.context.get("request")
        if request:
            uploaded_images = uploaded_images or request.FILES.getlist("uploaded_images")
        delete_image_ids = delete_image_ids or self._delete_image_ids()
        if delete_image_ids:
            images_to_delete = instance.images.filter(id__in=delete_image_ids)
            for image in images_to_delete:
                image.image.delete(save=False)
            images_to_delete.delete()
            self._clear_images_cache(instance)
        if instance.images.count() + len(uploaded_images) > settings.MAX_PRODUCT_IMAGES:
            available = settings.MAX_PRODUCT_IMAGES - instance.images.count()
            raise serializers.ValidationError({"uploaded_images": f"Pode adicionar mais {max(available, 0)} imagens."})
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        next_position = instance.images.count()
        self._save_images(instance, uploaded_images, start_position=next_position)
        self._clear_images_cache(instance)
        self._normalize_images(instance)
        self._clear_images_cache(instance)
        return instance


class ProductSummarySerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "title", "slug", "price", "city", "status", "primary_image"]

    def get_primary_image(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        images = obj.images.all()
        if not (user and user.is_authenticated and (user.is_staff or user.pk == obj.seller_id)):
            images = images.filter(moderation_status=ProductImage.ModerationStatus.APPROVED)
        image = images.filter(is_primary=True).first() or images.first()
        if not image:
            return None
        request = self.context.get("request")
        url = image.image.url
        return absolute_file_url(request, url)
