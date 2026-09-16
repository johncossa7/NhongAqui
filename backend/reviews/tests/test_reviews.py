import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from products.models import Product

User = get_user_model()


@pytest.mark.django_db
def test_user_can_review_seller_product():
    seller = User.objects.create_user(email="seller@example.com", password="Password123!")
    buyer = User.objects.create_user(email="buyer@example.com", password="Password123!")
    SellerProfile.objects.create(user=seller, display_name="Seller")
    SellerProfile.objects.create(user=buyer, display_name="Buyer")
    category = Category.objects.create(name="Moveis")
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Sofa",
        description="Tres lugares.",
        price="18000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
        status=Product.Status.SOLD,
    )

    client = APIClient()
    client.force_authenticate(buyer)
    response = client.post(
        "/api/v1/reviews/",
        {"product_id": product.id, "rating": 5, "comment": "Excelente."},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["rating"] == 5
