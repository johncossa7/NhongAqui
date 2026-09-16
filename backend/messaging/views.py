from django.db.models import Q
from rest_framework import permissions, viewsets

from common.permissions import IsParticipant

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsParticipant]
    filterset_fields = ("product",)

    def get_queryset(self):
        user = self.request.user
        queryset = (
            Conversation.objects.select_related(
                "product",
                "product__seller",
                "product__category",
                "buyer",
                "buyer__seller_profile",
                "seller",
                "seller__seller_profile",
            )
            .prefetch_related("messages", "product__images")
            .order_by("-last_message_at", "-updated_at")
        )
        if user.is_staff:
            return queryset
        return queryset.filter(Q(buyer=user) | Q(seller=user))


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ("conversation",)

    def get_queryset(self):
        user = self.request.user
        queryset = Message.objects.select_related("conversation", "sender", "sender__seller_profile")
        if user.is_staff:
            return queryset
        return queryset.filter(Q(conversation__buyer=user) | Q(conversation__seller=user))
