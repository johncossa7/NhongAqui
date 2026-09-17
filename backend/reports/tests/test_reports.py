import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import SellerProfile
from categories.models import Category
from products.models import Product
from reports.models import ModerationLog, Report, SupportRequest

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

    duplicate = client.post(
        "/api/v1/reports/",
        {"product_id": product.id, "reason": "spam", "description": "Segunda denuncia."},
        format="json",
    )
    assert duplicate.status_code == 400


@pytest.mark.django_db
def test_admin_can_resolve_report_and_action_is_logged():
    seller = User.objects.create_user(email="seller2@example.com", password="Password123!")
    reporter = User.objects.create_user(email="reporter2@example.com", password="Password123!")
    admin = User.objects.create_superuser(email="admin@example.com", password="Password123!")
    category = Category.objects.create(name="Moderacao")
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Produto denunciado",
        description="Descricao.",
        price="1000.00",
        condition=Product.Condition.USED,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    report = Report.objects.create(
        reporter=reporter,
        product=product,
        reported_user=seller,
        reason=Report.Reason.FRAUD,
    )
    client = APIClient()
    client.force_authenticate(admin)

    response = client.post(f"/api/v1/reports/{report.id}/resolve/")

    assert response.status_code == 200
    report.refresh_from_db()
    assert report.status == Report.Status.RESOLVED
    assert ModerationLog.objects.filter(action=ModerationLog.Action.REPORT_RESOLVED, actor=admin).exists()


@pytest.mark.django_db
def test_visitor_can_contact_support_and_admin_can_resolve_request():
    client = APIClient()
    created = client.post(
        "/api/v1/support-requests/",
        {
            "name": "Maria",
            "email": "maria@example.com",
            "category": "privacy",
            "subject": "Pedido sobre os meus dados",
            "message": "Quero saber quais dados estao associados a minha conta.",
        },
        format="json",
    )
    assert created.status_code == 201
    assert created.data["reference"].startswith("NHA-")
    assert client.get("/api/v1/support-requests/").status_code == 401

    admin = User.objects.create_superuser(email="support-admin@example.com", password="Password123!")
    client.force_authenticate(admin)
    requests = client.get("/api/v1/support-requests/?status=open")
    assert requests.status_code == 200
    assert requests.data["count"] == 1

    resolved = client.post(f"/api/v1/support-requests/{created.data['id']}/resolve/")
    assert resolved.status_code == 200
    assert resolved.data["status"] == SupportRequest.Status.RESOLVED
