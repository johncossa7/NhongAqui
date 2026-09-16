from django.db.models import Avg, Count
from rest_framework import serializers

from accounts.models import SellerProfile
from accounts.serializers import PublicUserSerializer
from products.models import Product
from products.serializers import ProductSummarySerializer

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = PublicUserSerializer(read_only=True)
    reviewed_user = PublicUserSerializer(read_only=True)
    product = ProductSummarySerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status__in=["reserved", "sold", "active"]),
        source="product",
        write_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "reviewer",
            "reviewed_user",
            "product",
            "product_id",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "reviewer", "reviewed_user", "product", "created_at"]

    def validate_product_id(self, product):
        user = self.context["request"].user
        if product.seller_id == user.id:
            raise serializers.ValidationError("Nao pode avaliar o seu proprio anuncio.")
        if Review.objects.filter(reviewer=user, product=product).exists():
            raise serializers.ValidationError("Ja avaliou este produto.")
        return product

    def create(self, validated_data):
        product = validated_data["product"]
        review = Review.objects.create(
            reviewer=self.context["request"].user,
            reviewed_user=product.seller,
            **validated_data,
        )
        stats = Review.objects.filter(reviewed_user=product.seller).aggregate(
            average=Avg("rating"),
            count=Count("id"),
        )
        SellerProfile.objects.update_or_create(
            user=product.seller,
            defaults={
                "display_name": getattr(product.seller, "seller_profile", None).display_name
                if hasattr(product.seller, "seller_profile")
                else product.seller.full_name,
                "rating_average": stats["average"] or 0,
                "rating_count": stats["count"] or 0,
            },
        )
        return review
