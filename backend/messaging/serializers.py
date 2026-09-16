from django.utils import timezone
from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from products.models import Product
from products.serializers import ProductSummarySerializer

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = PublicUserSerializer(read_only=True)
    conversation_id = serializers.PrimaryKeyRelatedField(
        queryset=Conversation.objects.all(),
        source="conversation",
        write_only=True,
    )

    class Meta:
        model = Message
        fields = ["id", "conversation", "conversation_id", "sender", "content", "read_at", "created_at"]
        read_only_fields = ["id", "conversation", "sender", "read_at", "created_at"]

    def validate_conversation_id(self, conversation):
        user = self.context["request"].user
        if conversation.buyer_id != user.id and conversation.seller_id != user.id and not user.is_staff:
            raise serializers.ValidationError("Sem permissao para esta conversa.")
        return conversation

    def create(self, validated_data):
        message = Message.objects.create(sender=self.context["request"].user, **validated_data)
        Conversation.objects.filter(pk=message.conversation_id).update(
            last_message_at=message.created_at,
            updated_at=timezone.now(),
        )
        return message


class ConversationSerializer(serializers.ModelSerializer):
    product = ProductSummarySerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status__in=["active", "reserved", "sold"]),
        source="product",
        write_only=True,
    )
    buyer = PublicUserSerializer(read_only=True)
    seller = PublicUserSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "product",
            "product_id",
            "buyer",
            "seller",
            "messages",
            "created_at",
            "updated_at",
            "last_message_at",
        ]
        read_only_fields = ["id", "product", "buyer", "seller", "messages", "created_at", "updated_at"]

    def validate_product_id(self, product):
        user = self.context["request"].user
        if product.seller_id == user.id:
            raise serializers.ValidationError("Nao pode iniciar conversa consigo proprio.")
        return product

    def create(self, validated_data):
        product = validated_data["product"]
        user = self.context["request"].user
        conversation, _created = Conversation.objects.get_or_create(
            product=product,
            buyer=user,
            seller=product.seller,
        )
        return conversation
