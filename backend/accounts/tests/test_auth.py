import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from accounts.models import SellerProfile, UserBlock
from categories.models import Category
from products.models import Product, ProductImage
from reports.models import ModerationLog, SupportRequest
from verification.models import VerificationRequest

User = get_user_model()


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    EMAIL_VERIFICATION_ENABLED=False,
)
def test_register_and_login_without_email_verification():
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
            "accept_terms": True,
            "accept_privacy": True,
        },
        format="json",
    )
    assert register.status_code == 201
    assert register.data["email"] == "ana@example.com"
    user = User.objects.get(email="ana@example.com")
    assert user.terms_version == "2026-09-18"
    assert user.privacy_version == "2026-09-18"
    assert user.terms_accepted_at is not None
    assert len(mail.outbox) == 0

    login = client.post(
        "/api/v1/auth/login/",
        {"email": "ana@example.com", "password": "StrongPass123!"},
        format="json",
    )
    assert login.status_code == 200
    assert "access" in login.data
    assert "refresh" in login.data


@pytest.mark.django_db
def test_register_requires_legal_acceptance():
    response = APIClient().post(
        "/api/v1/auth/register/",
        {
            "email": "legal@example.com",
            "password": "StrongPass123!",
            "accept_terms": False,
            "accept_privacy": True,
        },
        format="json",
    )

    assert response.status_code == 400
    assert "accept_terms" in response.data


@pytest.mark.django_db
@override_settings(EMAIL_VERIFICATION_ENABLED=True)
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
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    EMAIL_VERIFICATION_ENABLED=False,
)
def test_email_verification_endpoints_are_disabled():
    user = User.objects.create_user(email="disabled@example.com", password="StrongPass123!")
    client = APIClient()
    client.force_authenticate(user)

    resend = client.post("/api/v1/auth/email-verification/resend/")
    confirm = client.post(
        "/api/v1/auth/email-verification/confirm/",
        {"uid": "unused", "token": "unused"},
        format="json",
    )

    assert resend.status_code == 404
    assert confirm.status_code == 404
    assert len(mail.outbox) == 0


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    PASSWORD_RESET_ENABLED=True,
)
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
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    PASSWORD_RESET_ENABLED=False,
)
def test_password_reset_endpoints_are_disabled():
    response = APIClient().post(
        "/api/v1/auth/password-reset/",
        {"email": "reset@example.com"},
        format="json",
    )
    confirm = APIClient().post(
        "/api/v1/auth/password-reset/confirm/",
        {"uid": "unused", "token": "unused", "new_password": "StrongPass123!"},
        format="json",
    )

    assert response.status_code == 404
    assert confirm.status_code == 404
    assert len(mail.outbox) == 0


@pytest.mark.django_db(transaction=True)
def test_user_can_permanently_delete_account_and_files(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    user = User.objects.create_user(email="delete@example.com", password="Password123!")
    SellerProfile.objects.create(user=user, display_name="Delete")
    user.avatar.save("avatar.jpg", SimpleUploadedFile("avatar.jpg", b"avatar"), save=True)
    category = Category.objects.create(name="Account deletion")
    product = Product.objects.create(
        seller=user,
        category=category,
        title="Delete product",
        description="Delete this product",
        price="1000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
    )
    image = ProductImage.objects.create(
        product=product,
        image=SimpleUploadedFile("product.jpg", b"product"),
        is_primary=True,
    )
    verification = VerificationRequest.objects.create(
        user=user,
        full_name="Delete User",
        phone="+258840000000",
        document_type=VerificationRequest.DocumentType.BI,
        document_number="123456789",
        document_front=SimpleUploadedFile("document.jpg", b"document"),
    )
    support_request = SupportRequest.objects.create(
        user=user,
        name="Delete User",
        email=user.email,
        category=SupportRequest.Category.PRIVACY,
        subject="Existing privacy request",
        message="This support request remains available for the audit trail.",
    )
    avatar_path = tmp_path / user.avatar.name
    image_path = tmp_path / image.image.name
    document_path = tmp_path / verification.document_front.name
    client = APIClient()
    client.force_authenticate(user)

    response = client.post(
        "/api/v1/auth/account-delete/",
        {"current_password": "Password123!", "confirmation": "ELIMINAR"},
        format="json",
    )

    assert response.status_code == 204
    assert not User.objects.filter(email="delete@example.com").exists()
    assert not Product.objects.filter(pk=product.pk).exists()
    support_request.refresh_from_db()
    assert support_request.user is None
    assert not avatar_path.exists()
    assert not image_path.exists()
    assert not document_path.exists()


@pytest.mark.django_db
def test_account_deletion_requires_password_and_exact_confirmation():
    user = User.objects.create_user(email="keep@example.com", password="Password123!")
    client = APIClient()
    client.force_authenticate(user)

    wrong_password = client.post(
        "/api/v1/auth/account-delete/",
        {"current_password": "WrongPassword123!", "confirmation": "ELIMINAR"},
        format="json",
    )
    wrong_confirmation = client.post(
        "/api/v1/auth/account-delete/",
        {"current_password": "Password123!", "confirmation": "eliminar"},
        format="json",
    )

    assert wrong_password.status_code == 400
    assert wrong_confirmation.status_code == 400
    assert User.objects.filter(pk=user.pk).exists()


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
