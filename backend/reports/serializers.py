from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from products.models import Product
from products.serializers import ProductSummarySerializer

from .models import Report


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
