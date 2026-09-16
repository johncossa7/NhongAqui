import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from products.models import Product

User = get_user_model()


@pytest.mark.django_db
def test_user_can_add_and_remove_favorite():
    seller = User.objects.create_user(email="seller@example.com", password="Password123!")
    buyer = User.objects.create_user(email="buyer@example.com", password="Password123!")
    SellerProfile.objects.create(user=seller, display_name="Seller")
    SellerProfile.objects.create(user=buyer, display_name="Buyer")
    category = Category.objects.create(name="Jogos e Consolas")
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="PlayStation 5",
        description="Com comando.",
        price="52000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )

    client = APIClient()
    client.force_authenticate(buyer)
    created = client.post("/api/v1/favorites/", {"product_id": product.id}, format="json")
    assert created.status_code == 201

    favorite_id = created.data["id"]
    deleted = client.delete(f"/api/v1/favorites/{favorite_id}/")
    assert deleted.status_code == 204
