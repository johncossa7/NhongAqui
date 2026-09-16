from rest_framework import permissions, viewsets

from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ("status", "reason", "product")
    ordering_fields = ("created_at",)

    def get_queryset(self):
        queryset = Report.objects.select_related(
            "reporter",
            "reported_user",
            "product",
            "resolved_by",
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(reporter=self.request.user)
