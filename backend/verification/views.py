from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import SellerProfile, User
from reports.models import ModerationLog

from .models import VerificationRequest
from .serializers import VerificationRequestSerializer


class VerificationRequestViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = VerificationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = VerificationRequest.objects.select_related("user", "reviewed_by")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)

    def _review(self, request, verification, next_status, reason=""):
        verification.status = next_status
        verification.reviewed_at = timezone.now()
        verification.reviewed_by = request.user
        verification.rejection_reason = reason
        verification.save(update_fields=["status", "reviewed_at", "reviewed_by", "rejection_reason"])

        approved = next_status == VerificationRequest.Status.APPROVED
        verification.user.verification_status = (
            User.VerificationStatus.VERIFIED if approved else User.VerificationStatus.REJECTED
        )
        verification.user.save(update_fields=["verification_status", "updated_at"])
        profile, _ = SellerProfile.objects.get_or_create(
            user=verification.user,
            defaults={"display_name": verification.user.full_name},
        )
        profile.verified = approved
        profile.save(update_fields=["verified", "updated_at"])
        if approved:
            ModerationLog.record(request.user, ModerationLog.Action.USER_VERIFIED, verification.user)
        return Response(self.get_serializer(verification).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        return self._review(request, self.get_object(), VerificationRequest.Status.APPROVED)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        reason = str(request.data.get("reason", "")).strip()
        if not reason:
            return Response({"reason": "Indique o motivo da rejeicao."}, status=status.HTTP_400_BAD_REQUEST)
        return self._review(request, self.get_object(), VerificationRequest.Status.REJECTED, reason)
