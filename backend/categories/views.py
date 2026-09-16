from rest_framework import permissions, viewsets

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ("parent", "is_active")
    search_fields = ("name",)
    ordering_fields = ("sort_order", "name")

    def get_queryset(self):
        queryset = Category.objects.filter(is_active=True).prefetch_related("children")
        if self.request.user.is_staff:
            queryset = Category.objects.all().prefetch_related("children")
        return queryset.order_by("sort_order", "name")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return super().get_permissions()
