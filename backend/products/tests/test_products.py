import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from products.models import Product

User = get_user_model()


@pytest.fixture
def category():
    return Category.objects.create(name="Telemoveis e Tablets")


@pytest.fixture
def seller():
    user = User.objects.create_user(email="seller@example.com", password="Password123!")
    SellerProfile.objects.create(user=user, display_name="Seller")
    return user


@pytest.fixture
def other_user():
    user = User.objects.create_user(email="other@example.com", password="Password123!")
    SellerProfile.objects.create(user=user, display_name="Other")
    return user


@pytest.mark.django_db
def test_authenticated_user_can_create_product(category, seller):
    client = APIClient()
    client.force_authenticate(seller)
    response = client.post(
        "/api/v1/products/",
        {
            "category": category.id,
            "title": "iPhone 13",
            "description": "Em bom estado.",
            "price": "42000.00",
            "negotiable": True,
            "condition": "good",
            "province": "Maputo",
            "city": "Maputo",
            "neighborhood": "Polana",
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.data["status"] == Product.Status.ACTIVE


@pytest.mark.django_db
def test_only_owner_can_edit_product(category, seller, other_user):
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Samsung Galaxy",
        description="Telefone usado.",
        price="10000.00",
        condition=Product.Condition.USED,
        province="Maputo",
        city="Matola",
        status=Product.Status.ACTIVE,
    )
    client = APIClient()
    client.force_authenticate(other_user)
    denied = client.patch(f"/api/v1/products/{product.slug}/", {"title": "Tentativa"}, format="json")
    assert denied.status_code == 404

    client.force_authenticate(seller)
    allowed = client.patch(f"/api/v1/products/{product.slug}/", {"title": "Galaxy Atualizado"}, format="json")
    assert allowed.status_code == 200
    assert allowed.data["title"] == "Galaxy Atualizado"


@pytest.mark.django_db
def test_admin_can_delete_any_product(category, seller):
    admin = User.objects.create_superuser(email="admin@example.com", password="Password123!")
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Produto denunciado",
        description="Produto a remover.",
        price="1000.00",
        condition=Product.Condition.USED,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    client = APIClient()
    client.force_authenticate(admin)

    response = client.delete(f"/api/v1/products/{product.slug}/")

    assert response.status_code == 204
    product.refresh_from_db()
    assert product.status == Product.Status.DELETED
