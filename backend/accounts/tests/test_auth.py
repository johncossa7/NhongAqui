import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
def test_register_and_login():
    client = APIClient()
    register = client.post(
        "/api/v1/auth/register/",
        {
            "email": "ana@example.com",
            "password": "StrongPass123!",
            "first_name": "Ana",
            "last_name": "Mabunda",
            "phone": "+258840001111",
            "city": "Maputo",
            "display_name": "Ana Vendas",
        },
        format="json",
    )
    assert register.status_code == 201
    assert register.data["email"] == "ana@example.com"

    login = client.post(
        "/api/v1/auth/login/",
        {"email": "ana@example.com", "password": "StrongPass123!"},
        format="json",
    )
    assert login.status_code == 200
    assert "access" in login.data
    assert "refresh" in login.data


@pytest.mark.django_db
def test_profile_requires_authentication():
    client = APIClient()
    response = client.get("/api/v1/profile/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_admin_can_deactivate_user_account():
    admin = User.objects.create_superuser(email="admin@example.com", password="Password123!")
    user = User.objects.create_user(email="user@example.com", password="Password123!")
    client = APIClient()
    client.force_authenticate(admin)

    response = client.delete(f"/api/v1/users/{user.id}/")

    assert response.status_code == 204
    user.refresh_from_db()
    assert user.is_active is False


@pytest.mark.django_db
def test_regular_user_cannot_deactivate_accounts():
    owner = User.objects.create_user(email="owner@example.com", password="Password123!")
    user = User.objects.create_user(email="target@example.com", password="Password123!")
    client = APIClient()
    client.force_authenticate(owner)

    response = client.delete(f"/api/v1/users/{user.id}/")

    assert response.status_code == 403
    user.refresh_from_db()
    assert user.is_active is True


@pytest.mark.django_db
def test_admin_cannot_deactivate_own_account():
    admin = User.objects.create_superuser(email="admin@example.com", password="Password123!")
    client = APIClient()
    client.force_authenticate(admin)

    response = client.delete(f"/api/v1/users/{admin.id}/")

    assert response.status_code == 400
    admin.refresh_from_db()
    assert admin.is_active is True
