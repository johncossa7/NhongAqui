from rest_framework import permissions, viewsets

from .models import VerificationRequest
from .serializers import VerificationRequestSerializer


class VerificationRequestViewSet(viewsets.ModelViewSet):
    serializer_class = VerificationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = VerificationRequest.objects.select_related("user", "reviewed_by")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)
