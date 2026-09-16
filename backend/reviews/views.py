from rest_framework import permissions, viewsets

from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ("reviewed_user", "product", "rating")
    ordering_fields = ("created_at", "rating")

    def get_queryset(self):
        return Review.objects.select_related(
            "reviewer",
            "reviewer__seller_profile",
            "reviewed_user",
            "reviewed_user__seller_profile",
            "product",
        )

    def perform_create(self, serializer):
        serializer.save()
