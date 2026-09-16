import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from messaging.models import Conversation
from products.models import Product

User = get_user_model()


@pytest.mark.django_db
def test_conversation_is_unique_and_private():
    seller = User.objects.create_user(email="seller@example.com", password="Password123!")
    buyer = User.objects.create_user(email="buyer@example.com", password="Password123!")
    stranger = User.objects.create_user(email="stranger@example.com", password="Password123!")
    for user in [seller, buyer, stranger]:
        SellerProfile.objects.create(user=user, display_name=user.email)
    category = Category.objects.create(name="Eletronica")
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="TV Samsung",
        description="43 polegadas.",
        price="24000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Matola",
        status=Product.Status.ACTIVE,
    )

    client = APIClient()
    client.force_authenticate(buyer)
    first = client.post("/api/v1/conversations/", {"product_id": product.id}, format="json")
    second = client.post("/api/v1/conversations/", {"product_id": product.id}, format="json")
    assert first.status_code == 201
    assert second.status_code == 201
    assert Conversation.objects.count() == 1

    client.force_authenticate(stranger)
    response = client.get(f"/api/v1/conversations/{first.data['id']}/")
    assert response.status_code == 404
