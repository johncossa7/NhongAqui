from django.db.models import F
from django.utils import timezone
from django_filters.rest_framework import FilterSet, NumberFilter
from rest_framework import parsers, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.permissions import IsSellerOrAdminOrReadOnly

from .models import Product, ProductImage
from .serializers import ProductSerializer


class ProductFilter(FilterSet):
    min_price = NumberFilter(field_name="price", lookup_expr="gte")
    max_price = NumberFilter(field_name="price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = {
            "seller": ["exact"],
            "category": ["exact"],
            "condition": ["exact"],
            "city": ["icontains"],
            "province": ["icontains"],
            "featured": ["exact"],
            "status": ["exact"],
        }


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsSellerOrAdminOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filterset_class = ProductFilter
    search_fields = ("title", "description", "city", "neighborhood", "seller__seller_profile__display_name")
    ordering_fields = ("price", "created_at", "published_at", "views_count")
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            Product.objects.select_related("seller", "seller__seller_profile", "category")
            .prefetch_related("images", "favorites")
            .exclude(status=Product.Status.DELETED)
        )
        if self.request.user.is_staff:
            return queryset
        if self.action in ["update", "partial_update", "destroy", "delete_image"]:
            return queryset.filter(seller=self.request.user)
        if self.request.query_params.get("mine") == "true" and self.request.user.is_authenticated:
            return queryset.filter(seller=self.request.user)
        return queryset.filter(status__in=[Product.Status.ACTIVE, Product.Status.RESERVED, Product.Status.SOLD])

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

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user, status=Product.Status.ACTIVE, published_at=timezone.now())

    def perform_destroy(self, instance):
        instance.status = Product.Status.DELETED
        instance.save(update_fields=["status", "updated_at"])
        if self.request.user.is_staff:
            from reports.models import ModerationLog

            ModerationLog.record(self.request.user, ModerationLog.Action.PRODUCT_DELETED, instance)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        queryset = self.filter_queryset(self.get_queryset().filter(seller=request.user))
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)

    @action(detail=True, methods=["post"])
    def mark_reserved(self, request, slug=None):
        product = self.get_object()
        product.status = Product.Status.RESERVED
        product.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(product).data)

    @action(detail=True, methods=["post"])
    def mark_sold(self, request, slug=None):
        product = self.get_object()
        product.status = Product.Status.SOLD
        product.sold_at = timezone.now()
        product.save(update_fields=["status", "sold_at", "updated_at"])
        return Response(self.get_serializer(product).data)

    @action(detail=True, methods=["delete"], url_path=r"images/(?P<image_id>[^/.]+)")
    def delete_image(self, request, slug=None, image_id=None):
        product = self.get_object()
        image = product.images.filter(pk=image_id).first()
        if not image:
            return Response({"detail": "Imagem nao encontrada."}, status=status.HTTP_404_NOT_FOUND)
        if product.images.count() <= 1:
            return Response(
                {"detail": "O anuncio deve manter pelo menos uma fotografia."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        image.image.delete(save=False)
        image.delete()
        self._normalize_images(product)
        product.refresh_from_db()
        return Response(self.get_serializer(product).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def suspend(self, request, slug=None):
        product = self.get_object()
        product.status = Product.Status.SUSPENDED
        product.save(update_fields=["status", "updated_at"])
        from reports.models import ModerationLog

        ModerationLog.record(request.user, ModerationLog.Action.PRODUCT_SUSPENDED, product)
        return Response(self.get_serializer(product).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def activate(self, request, slug=None):
        product = self.get_object()
        product.status = Product.Status.ACTIVE
        product.published_at = product.published_at or timezone.now()
        product.save(update_fields=["status", "published_at", "updated_at"])
        from reports.models import ModerationLog

        ModerationLog.record(request.user, ModerationLog.Action.PRODUCT_REACTIVATED, product)
        return Response(self.get_serializer(product).data)

    @action(
        detail=True,
        methods=["post"],
        url_path=r"images/(?P<image_id>[^/.]+)/moderate",
        permission_classes=[permissions.IsAdminUser],
    )
    def moderate_image(self, request, slug=None, image_id=None):
        product = self.get_object()
        image = product.images.filter(pk=image_id).first()
        if not image:
            return Response({"detail": "Imagem nao encontrada."}, status=status.HTTP_404_NOT_FOUND)
        next_status = request.data.get("status")
        if next_status not in [ProductImage.ModerationStatus.APPROVED, ProductImage.ModerationStatus.REJECTED]:
            return Response({"status": "Use approved ou rejected."}, status=status.HTTP_400_BAD_REQUEST)
        image.moderation_status = next_status
        image.moderation_reason = str(request.data.get("reason", "")).strip()
        image.save(update_fields=["moderation_status", "moderation_reason"])
        from reports.models import ModerationLog

        log_action = (
            ModerationLog.Action.IMAGE_APPROVED
            if next_status == ProductImage.ModerationStatus.APPROVED
            else ModerationLog.Action.IMAGE_REJECTED
        )
        ModerationLog.record(request.user, log_action, image, {"product_id": product.pk})
        return Response(self.get_serializer(product).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny])
    def view(self, request, slug=None):
        Product.objects.filter(slug=slug).update(views_count=F("views_count") + 1)
        product = self.get_object()
        product.refresh_from_db()
        return Response({"views_count": product.views_count})
