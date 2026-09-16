import pytest
from rest_framework.test import APIClient


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
