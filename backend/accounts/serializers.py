from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

from .models import SellerProfile

User = get_user_model()


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
            "avatar",
            "seller_profile",
        ]


class UserSerializer(PublicUserSerializer):
    class Meta(PublicUserSerializer.Meta):
        fields = PublicUserSerializer.Meta.fields + [
            "email",
            "phone",
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["email", "is_staff", "is_superuser", "is_active", "date_joined", "created_at", "updated_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    display_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

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
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        display_name = validated_data.pop("display_name", "")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        SellerProfile.objects.create(
            user=user,
            display_name=display_name or user.full_name,
        )
        return user


class ProfileUpdateSerializer(UserSerializer):
    seller_profile = SellerProfileSerializer(required=False)

    class Meta(UserSerializer.Meta):
        read_only_fields = ["email", "date_joined", "created_at", "updated_at"]

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
            uid = serializers.CharField().to_representation(user.pk)
            token = default_token_generator.make_token(user)
            send_mail(
                "Recuperacao de palavra-passe NhongAqui",
                f"Use este uid e token para redefinir: uid={uid} token={token}",
                "no-reply@nhongaqui.local",
                [user.email],
                fail_silently=True,
            )


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
