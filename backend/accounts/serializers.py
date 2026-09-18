from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

from .emails import send_password_reset_email, send_verification_email
from .models import SellerProfile, UserBlock

User = get_user_model()
LEGAL_VERSION = "2026-09-17"


class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = [
            "display_name",
            "bio",
            "rating_average",
            "rating_count",
            "products_sold",
            "verified",
        ]
        read_only_fields = ["rating_average", "rating_count", "products_sold", "verified"]


class PublicUserSerializer(serializers.ModelSerializer):
    seller_profile = SellerProfileSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    email_verified = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "first_name",
            "last_name",
            "city",
            "province",
            "neighborhood",
            "account_type",
            "verification_status",
            "email_verified",
            "is_blocked",
            "avatar",
            "seller_profile",
        ]

    def get_email_verified(self, obj) -> bool:
        return obj.email_verified_at is not None

    def get_is_blocked(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or request.user.pk == obj.pk:
            return False
        return UserBlock.objects.filter(blocker=request.user, blocked=obj).exists()


class UserSerializer(PublicUserSerializer):
    class Meta(PublicUserSerializer.Meta):
        fields = PublicUserSerializer.Meta.fields + [
            "email",
            "email_verified_at",
            "phone",
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "email",
            "email_verified_at",
            "verification_status",
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "created_at",
            "updated_at",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    display_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    accept_terms = serializers.BooleanField(write_only=True)
    accept_privacy = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "province",
            "city",
            "neighborhood",
            "account_type",
            "display_name",
            "accept_terms",
            "accept_privacy",
        ]
        read_only_fields = ["id"]

    def validate_accept_terms(self, value):
        if not value:
            raise serializers.ValidationError("Tem de aceitar os Termos e Condicoes.")
        return value

    def validate_accept_privacy(self, value):
        if not value:
            raise serializers.ValidationError("Tem de aceitar a Politica de Privacidade.")
        return value

    def create(self, validated_data):
        display_name = validated_data.pop("display_name", "")
        validated_data.pop("accept_terms")
        validated_data.pop("accept_privacy")
        password = validated_data.pop("password")
        accepted_at = timezone.now()
        user = User.objects.create_user(
            password=password,
            terms_accepted_at=accepted_at,
            terms_version=LEGAL_VERSION,
            privacy_accepted_at=accepted_at,
            privacy_version=LEGAL_VERSION,
            **validated_data,
        )
        SellerProfile.objects.create(
            user=user,
            display_name=display_name or user.full_name,
        )
        if settings.EMAIL_VERIFICATION_ENABLED:
            send_verification_email(user)
        return user


class ProfileUpdateSerializer(UserSerializer):
    seller_profile = SellerProfileSerializer(required=False)

    class Meta(UserSerializer.Meta):
        read_only_fields = UserSerializer.Meta.read_only_fields

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("seller_profile", None)
        instance = super().update(instance, validated_data)
        if profile_data is not None:
            SellerProfile.objects.update_or_create(
                user=instance,
                defaults={
                    "display_name": profile_data.get("display_name", instance.full_name),
                    "bio": profile_data.get("bio", ""),
                },
            )
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Palavra-passe atual invalida.")
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self, **kwargs):
        email = self.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            send_password_reset_email(user)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate(self, attrs):
        try:
            raw_uid = attrs["uid"]
            if raw_uid.isdigit():
                user_id = raw_uid
            else:
                user_id = force_str(urlsafe_base64_decode(raw_uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except Exception as exc:
            raise serializers.ValidationError("Pedido de recuperacao invalido.") from exc
        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError("Token invalido ou expirado.")
        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class EmailVerificationConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attrs):
        try:
            user_id = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=user_id, is_active=True)
        except Exception as exc:
            raise serializers.ValidationError("Link de verificacao invalido.") from exc
        if user.email_verified_at is None and not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError("Link de verificacao invalido ou expirado.")
        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        if user.email_verified_at is None:
            user.email_verified_at = timezone.now()
            user.save(update_fields=["email_verified_at", "updated_at"])
        return user
