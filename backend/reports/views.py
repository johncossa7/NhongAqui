from django.utils import timezone
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import ModerationLog, Report, SupportRequest
from .serializers import ModerationLogSerializer, ReportSerializer, SupportRequestSerializer


class ReportViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
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

    def _finish(self, request, report, next_status, log_action):
        report.status = next_status
        report.resolved_at = timezone.now()
        report.resolved_by = request.user
        report.save(update_fields=["status", "resolved_at", "resolved_by"])
        ModerationLog.record(request.user, log_action, report)
        return Response(self.get_serializer(report).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        return self._finish(request, self.get_object(), Report.Status.RESOLVED, ModerationLog.Action.REPORT_RESOLVED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def dismiss(self, request, pk=None):
        return self._finish(request, self.get_object(), Report.Status.DISMISSED, ModerationLog.Action.REPORT_DISMISSED)


class ModerationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ModerationLog.objects.select_related("actor")
    serializer_class = ModerationLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ("action", "target_type")
    ordering_fields = ("created_at",)


class SupportRequestViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SupportRequest.objects.select_related("user", "resolved_by")
    serializer_class = SupportRequestSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "support"
    filterset_fields = ("status", "category")
    ordering_fields = ("created_at",)

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_throttles(self):
        if self.action == "create":
            return [ScopedRateThrottle()]
        return []

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        support_request = self.get_object()
        support_request.status = SupportRequest.Status.RESOLVED
        support_request.resolved_at = timezone.now()
        support_request.resolved_by = request.user
        support_request.save(update_fields=["status", "resolved_at", "resolved_by", "updated_at"])
        return Response(self.get_serializer(support_request).data)
