import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from products.models import Product

User = get_user_model()


@pytest.mark.django_db
def test_user_can_report_product():
    seller = User.objects.create_user(email="seller@example.com", password="Password123!")
    reporter = User.objects.create_user(email="reporter@example.com", password="Password123!")
    SellerProfile.objects.create(user=seller, display_name="Seller")
    SellerProfile.objects.create(user=reporter, display_name="Reporter")
    category = Category.objects.create(name="Outros")
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Produto suspeito",
        description="Descricao.",
        price="1000.00",
        condition=Product.Condition.USED,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )

    client = APIClient()
    client.force_authenticate(reporter)
    response = client.post(
        "/api/v1/reports/",
        {"product_id": product.id, "reason": "fraud", "description": "Parece fraude."},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["reason"] == "fraud"
