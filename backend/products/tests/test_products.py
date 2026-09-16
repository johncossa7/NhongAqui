import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from products.models import Product, ProductImage

User = get_user_model()


def tiny_gif(name: str):
    return SimpleUploadedFile(
        name,
        b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02L\x01\x00;",
        content_type="image/gif",
    )


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
def test_authenticated_user_can_create_product_with_multiple_images(category, seller):
    client = APIClient()
    client.force_authenticate(seller)
    images = [tiny_gif(f"produto-{index}.gif") for index in range(6)]

    response = client.post(
        "/api/v1/products/",
        {
            "category": category.id,
            "title": "Lote com varias fotos",
            "description": "Produto fotografado de varios angulos.",
            "price": "9000.00",
            "negotiable": True,
            "condition": "good",
            "province": "Maputo",
            "city": "Maputo",
            "uploaded_images": images,
        },
        format="multipart",
    )

    assert response.status_code == 201, response.data
    assert len(response.data["images"]) == 6
    assert ProductImage.objects.filter(product__slug=response.data["slug"]).count() == 6


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
    image = tiny_gif("tenis.gif")
    client = APIClient()
    client.force_authenticate(seller)

    response = client.patch(
        f"/api/v1/products/{product.slug}/",
        {"price": "3000.00", "uploaded_images": [image]},
        format="multipart",
    )

    assert response.status_code == 200, response.data
    product.refresh_from_db()
    assert str(product.price) == "3000.00"
    assert ProductImage.objects.filter(product=product).count() == 1


@pytest.mark.django_db
def test_owner_can_remove_and_add_images_in_same_update(category, seller):
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Sapatilhas",
        description="Sapatilhas novas.",
        price="3500.00",
        condition=Product.Condition.NEW,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    images = [
        ProductImage.objects.create(
            product=product,
            image=tiny_gif(f"sapatilha-{index}.gif"),
            position=index,
            is_primary=index == 0,
        )
        for index in range(8)
    ]
    new_image = tiny_gif("sapatilha-nova.gif")
    client = APIClient()
    client.force_authenticate(seller)

    response = client.patch(
        f"/api/v1/products/{product.slug}/",
        {"delete_image_ids": [images[0].id], "uploaded_images": [new_image]},
        format="multipart",
    )

    assert response.status_code == 200, response.data
    product.refresh_from_db()
    assert ProductImage.objects.filter(product=product).count() == 8
    assert ProductImage.objects.filter(pk=images[0].id).exists() is False
    assert product.images.order_by("position", "id").first().is_primary is True


@pytest.mark.django_db
def test_owner_can_add_multiple_images_until_limit(category, seller):
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="PlayStation",
        description="Consola com jogos.",
        price="22000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    images = [tiny_gif(f"playstation-{index}.gif") for index in range(8)]
    client = APIClient()
    client.force_authenticate(seller)

    response = client.patch(
        f"/api/v1/products/{product.slug}/",
        {"uploaded_images": images},
        format="multipart",
    )

    assert response.status_code == 200, response.data
    assert len(response.data["images"]) == 8
    assert ProductImage.objects.filter(product=product).count() == 8


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
        image=tiny_gif("camera.gif"),
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
        image=tiny_gif("mesa.gif"),
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
