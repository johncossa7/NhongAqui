from django.conf import settings
from rest_framework import serializers

from .models import VerificationRequest


class VerificationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRequest
        fields = [
            "id",
            "full_name",
            "phone",
            "nuit",
            "document_type",
            "document_number",
            "document_front",
            "document_back",
            "selfie",
            "status",
            "submitted_at",
            "reviewed_at",
            "rejection_reason",
        ]
        read_only_fields = ["id", "status", "submitted_at", "reviewed_at", "rejection_reason"]
        extra_kwargs = {
            "document_front": {"write_only": True, "required": False},
            "document_back": {"write_only": True, "required": False},
            "selfie": {"write_only": True, "required": False},
        }

    def validate(self, attrs):
        if not settings.VERIFICATION_UPLOADS_ENABLED:
            for field in ["document_front", "document_back", "selfie"]:
                if attrs.get(field):
                    raise serializers.ValidationError(
                        "Upload de documentos esta desativado nesta versao."
                    )
        user = self.context["request"].user
        if not self.instance and VerificationRequest.objects.filter(
            user=user,
            status=VerificationRequest.Status.PENDING,
        ).exists():
            raise serializers.ValidationError("Ja existe um pedido de verificacao pendente.")
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        verification = VerificationRequest.objects.create(user=user, **validated_data)
        user.verification_status = user.VerificationStatus.PENDING
        user.save(update_fields=["verification_status", "updated_at"])
        return verification
