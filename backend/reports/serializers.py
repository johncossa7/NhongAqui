from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from products.models import Product
from products.serializers import ProductSummarySerializer

from .models import ModerationLog, Report, SupportRequest


class ReportSerializer(serializers.ModelSerializer):
    reporter = PublicUserSerializer(read_only=True)
    product = ProductSummarySerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.exclude(status="deleted"),
        source="product",
        write_only=True,
    )
    reported_user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter",
            "product",
            "product_id",
            "reported_user",
            "reason",
            "description",
            "status",
            "created_at",
            "resolved_at",
            "resolved_by",
        ]
        read_only_fields = [
            "id",
            "reporter",
            "product",
            "reported_user",
            "status",
            "created_at",
            "resolved_at",
            "resolved_by",
        ]

    def create(self, validated_data):
        product = validated_data["product"]
        return Report.objects.create(
            reporter=self.context["request"].user,
            reported_user=product.seller,
            **validated_data,
        )

    def validate_product_id(self, product):
        user = self.context["request"].user
        if product.seller_id == user.id:
            raise serializers.ValidationError("Nao pode denunciar o seu proprio anuncio.")
        if Report.objects.filter(reporter=user, product=product, status=Report.Status.PENDING).exists():
            raise serializers.ValidationError("Ja enviou uma denuncia pendente para este anuncio.")
        return product


class ModerationLogSerializer(serializers.ModelSerializer):
    actor = PublicUserSerializer(read_only=True)
    action_label = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = ModerationLog
        fields = [
            "id",
            "actor",
            "action",
            "action_label",
            "target_type",
            "target_id",
            "target_label",
            "details",
            "created_at",
        ]


class SupportRequestSerializer(serializers.ModelSerializer):
    reference = serializers.CharField(read_only=True)
    name = serializers.CharField(min_length=2, max_length=120)
    subject = serializers.CharField(min_length=4, max_length=160)
    message = serializers.CharField(min_length=20, max_length=3000)

    class Meta:
        model = SupportRequest
        fields = [
            "id",
            "reference",
            "name",
            "email",
            "category",
            "subject",
            "message",
            "status",
            "created_at",
            "updated_at",
            "resolved_at",
        ]
        read_only_fields = ["id", "reference", "status", "created_at", "updated_at", "resolved_at"]

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user if request.user.is_authenticated else None
        return SupportRequest.objects.create(user=user, **validated_data)
