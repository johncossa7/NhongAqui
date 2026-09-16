from rest_framework import serializers

from products.models import Product
from products.serializers import ProductSummarySerializer

from .models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSummarySerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status__in=["active", "reserved", "sold"]),
        source="product",
        write_only=True,
    )

    class Meta:
        model = Favorite
        fields = ["id", "product", "product_id", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        user = self.context["request"].user
        product = attrs["product"]
        if Favorite.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("Produto ja esta nos favoritos.")
        return attrs
