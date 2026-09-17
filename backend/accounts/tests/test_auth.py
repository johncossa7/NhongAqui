import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from accounts.models import SellerProfile, UserBlock
from reports.models import ModerationLog
from verification.models import VerificationRequest

User = get_user_model()


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
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
    assert len(mail.outbox) == 1
    assert "/verificar-email?" in mail.outbox[0].body

    login = client.post(
        "/api/v1/auth/login/",
        {"email": "ana@example.com", "password": "StrongPass123!"},
        format="json",
    )
    assert login.status_code == 200
    assert "access" in login.data
    assert "refresh" in login.data


@pytest.mark.django_db
def test_user_can_confirm_email():
    user = User.objects.create_user(email="confirm@example.com", password="StrongPass123!")
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    response = APIClient().post(
        "/api/v1/auth/email-verification/confirm/",
        {"uid": uid, "token": token},
        format="json",
    )

    assert response.status_code == 200
    user.refresh_from_db()
    assert user.email_verified_at is not None


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_password_reset_sends_frontend_link():
    User.objects.create_user(email="reset@example.com", password="StrongPass123!")

    response = APIClient().post(
        "/api/v1/auth/password-reset/",
        {"email": "reset@example.com"},
        format="json",
    )

    assert response.status_code == 200
    assert len(mail.outbox) == 1
    assert "/redefinir-password?uid=" in mail.outbox[0].body
    assert "token=" in mail.outbox[0].body


@pytest.mark.django_db
def test_user_can_block_and_unblock_another_user():
    blocker = User.objects.create_user(email="blocker@example.com", password="Password123!")
    blocked = User.objects.create_user(email="blocked@example.com", password="Password123!")
    SellerProfile.objects.create(user=blocked, display_name="Blocked")
    client = APIClient()
    client.force_authenticate(blocker)

    blocked_response = client.post(f"/api/v1/users/{blocked.id}/block/")
    assert blocked_response.status_code == 200
    assert UserBlock.objects.filter(blocker=blocker, blocked=blocked).exists()

    unblocked_response = client.delete(f"/api/v1/users/{blocked.id}/block/")
    assert unblocked_response.status_code == 204
    assert not UserBlock.objects.filter(blocker=blocker, blocked=blocked).exists()


@pytest.mark.django_db
def test_admin_can_approve_seller_verification():
    seller = User.objects.create_user(email="verify-seller@example.com", password="Password123!")
    admin = User.objects.create_superuser(email="verify-admin@example.com", password="Password123!")
    client = APIClient()
    client.force_authenticate(seller)
    created = client.post(
        "/api/v1/verification/",
        {
            "full_name": "Seller Verify",
            "phone": "+258840000000",
            "document_type": "bi",
            "document_number": "123456789",
        },
        format="json",
    )
    assert created.status_code == 201
    seller.refresh_from_db()
    assert seller.verification_status == User.VerificationStatus.PENDING

    client.force_authenticate(admin)
    approved = client.post(f"/api/v1/verification/{created.data['id']}/approve/")

    assert approved.status_code == 200
    seller.refresh_from_db()
    assert seller.verification_status == User.VerificationStatus.VERIFIED
    assert SellerProfile.objects.get(user=seller).verified is True
    assert VerificationRequest.objects.get(pk=created.data["id"]).status == VerificationRequest.Status.APPROVED
    assert ModerationLog.objects.filter(action=ModerationLog.Action.USER_VERIFIED, actor=admin).exists()


@pytest.mark.django_db
def test_profile_requires_authentication():
    client = APIClient()
    response = client.get("/api/v1/profile/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_profile_cannot_self_assign_verification_or_admin_permissions():
    user = User.objects.create_user(email="profile@example.com", password="Password123!")
    SellerProfile.objects.create(user=user, display_name="Profile")
    client = APIClient()
    client.force_authenticate(user)

    response = client.patch(
        "/api/v1/profile/",
        {"verification_status": "verified", "is_staff": True, "is_superuser": True},
        format="json",
    )

    assert response.status_code == 200
    user.refresh_from_db()
    assert user.verification_status == User.VerificationStatus.UNVERIFIED
    assert user.is_staff is False
    assert user.is_superuser is False


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
