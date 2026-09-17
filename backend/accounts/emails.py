from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def account_token(user) -> tuple[str, str]:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    return uid, default_token_generator.make_token(user)


def send_verification_email(user) -> None:
    uid, token = account_token(user)
    query = urlencode({"uid": uid, "token": token})
    url = f"{settings.WEB_APP_URL}/verificar-email?{query}"
    send_mail(
        "Confirme o seu email no NhongAqui",
        f"Confirme o seu endereco de email atraves deste link: {url}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=True,
    )


def send_password_reset_email(user) -> None:
    uid, token = account_token(user)
    query = urlencode({"uid": uid, "token": token})
    url = f"{settings.WEB_APP_URL}/redefinir-password?{query}"
    send_mail(
        "Recuperacao de palavra-passe NhongAqui",
        f"Redefina a sua palavra-passe atraves deste link: {url}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=True,
    )
