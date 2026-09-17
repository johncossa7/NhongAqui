from io import BytesIO

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from products.models import Product, ProductImage

User = get_user_model()


def make_test_image(name: str):
    output = BytesIO()
    Image.new("RGB", (64, 64), color=(25, 120, 70)).save(output, format="JPEG")
    return SimpleUploadedFile(name, output.getvalue(), content_type="image/jpeg")


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
def test_product_requires_at_least_one_image(category, seller):
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
    assert response.status_code == 400
    assert "uploaded_images" in response.data


@pytest.mark.django_db
def test_authenticated_user_can_create_product_with_multiple_images(category, seller):
    client = APIClient()
    client.force_authenticate(seller)
    images = [make_test_image(f"produto-{index}.jpg") for index in range(6)]

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
    assert response.data["images"][0]["image"].startswith("http://testserver/media/")
    assert response.data["images"][0]["image"].endswith(".webp")
    assert response.data["images"][0]["moderation_status"] == ProductImage.ModerationStatus.PENDING
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
    image = make_test_image("tenis.jpg")
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
            image=make_test_image(f"sapatilha-{index}.jpg"),
            position=index,
            is_primary=index == 0,
        )
        for index in range(8)
    ]
    new_image = make_test_image("sapatilha-nova.jpg")
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
    assert response.data["images"][-1]["image"].endswith(".webp")


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
    images = [make_test_image(f"playstation-{index}.jpg") for index in range(8)]
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
        image=make_test_image("camera.jpg"),
        is_primary=True,
    )
    ProductImage.objects.create(product=product, image=make_test_image("camera-2.jpg"), position=1)
    client = APIClient()
    client.force_authenticate(seller)

    response = client.delete(f"/api/v1/products/{product.slug}/images/{image.id}/")

    assert response.status_code == 200
    assert ProductImage.objects.filter(pk=image.id).exists() is False
    assert len(response.data["images"]) == 1


@pytest.mark.django_db
def test_owner_cannot_delete_last_product_image(category, seller):
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Camera unica",
        description="Camera em bom estado.",
        price="5000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    image = ProductImage.objects.create(product=product, image=make_test_image("unica.jpg"), is_primary=True)
    client = APIClient()
    client.force_authenticate(seller)

    response = client.delete(f"/api/v1/products/{product.slug}/images/{image.id}/")

    assert response.status_code == 400
    assert ProductImage.objects.filter(pk=image.id).exists()


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
        image=make_test_image("mesa.jpg"),
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


@pytest.mark.django_db
def test_pending_images_are_private_until_admin_approves(category, seller):
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Imagem moderada",
        description="Produto com fotografia pendente.",
        price="1000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    image = ProductImage.objects.create(product=product, image=make_test_image("pendente.jpg"), is_primary=True)

    public_response = APIClient().get(f"/api/v1/products/{product.slug}/")
    assert public_response.status_code == 200
    assert public_response.data["images"] == []

    owner_client = APIClient()
    owner_client.force_authenticate(seller)
    owner_response = owner_client.get(f"/api/v1/products/{product.slug}/")
    assert len(owner_response.data["images"]) == 1

    admin = User.objects.create_superuser(email="image-admin@example.com", password="Password123!")
    admin_client = APIClient()
    admin_client.force_authenticate(admin)
    approved = admin_client.post(
        f"/api/v1/products/{product.slug}/images/{image.id}/moderate/",
        {"status": "approved"},
        format="json",
    )
    assert approved.status_code == 200
    public_response = APIClient().get(f"/api/v1/products/{product.slug}/")
    assert len(public_response.data["images"]) == 1
