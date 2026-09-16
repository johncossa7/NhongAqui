import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from products.models import Product, ProductImage

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
def test_owner_can_update_price_and_add_images(category, seller):
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Tenis usados",
        description="Tenis em bom estado.",
        price="2500.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    image = SimpleUploadedFile(
        "tenis.gif",
        b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02L\x01\x00;",
        content_type="image/gif",
    )
    client = APIClient()
    client.force_authenticate(seller)

    response = client.patch(
        f"/api/v1/products/{product.slug}/",
        {"price": "3000.00", "uploaded_images": [image]},
        format="multipart",
    )

    assert response.status_code == 200
    product.refresh_from_db()
    assert str(product.price) == "3000.00"
    assert ProductImage.objects.filter(product=product).count() == 1


@pytest.mark.django_db
def test_owner_can_delete_product_image(category, seller):
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Camera usada",
        description="Camera em bom estado.",
        price="5000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    image = ProductImage.objects.create(
        product=product,
        image=SimpleUploadedFile(
            "camera.gif",
            b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02L\x01\x00;",
            content_type="image/gif",
        ),
        is_primary=True,
    )
    client = APIClient()
    client.force_authenticate(seller)

    response = client.delete(f"/api/v1/products/{product.slug}/images/{image.id}/")

    assert response.status_code == 200
    assert ProductImage.objects.filter(pk=image.id).exists() is False
    assert response.data["images"] == []


@pytest.mark.django_db
def test_user_cannot_delete_other_seller_image(category, seller, other_user):
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Mesa usada",
        description="Mesa em madeira.",
        price="1500.00",
        condition=Product.Condition.USED,
        province="Maputo",
        city="Matola",
        status=Product.Status.ACTIVE,
    )
    image = ProductImage.objects.create(
        product=product,
        image=SimpleUploadedFile(
            "mesa.gif",
            b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02L\x01\x00;",
            content_type="image/gif",
        ),
        is_primary=True,
    )
    client = APIClient()
    client.force_authenticate(other_user)

    response = client.delete(f"/api/v1/products/{product.slug}/images/{image.id}/")

    assert response.status_code == 404
    assert ProductImage.objects.filter(pk=image.id).exists()


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
