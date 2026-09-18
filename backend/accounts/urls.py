from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AccountDeleteView,
    ChangePasswordView,
    EmailVerificationConfirmView,
    LoginView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ResendEmailVerificationView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("password-change/", ChangePasswordView.as_view(), name="password_change"),
    path("account-delete/", AccountDeleteView.as_view(), name="account_delete"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("email-verification/confirm/", EmailVerificationConfirmView.as_view(), name="email_verification_confirm"),
    path("email-verification/resend/", ResendEmailVerificationView.as_view(), name="email_verification_resend"),
]
