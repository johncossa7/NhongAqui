from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.permissions import IsParticipant
from notifications.models import Notification

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
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
            .annotate(
                unread_count=Count(
                    "messages",
                    filter=Q(messages__read_at__isnull=True) & ~Q(messages__sender=user),
                )
            )
            .order_by("-last_message_at", "-updated_at")
        )
        if user.is_staff:
            return queryset
        return queryset.filter(Q(buyer=user) | Q(seller=user))

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = Message.objects.filter(
            Q(conversation__buyer=request.user) | Q(conversation__seller=request.user),
            read_at__isnull=True,
        ).exclude(sender=request.user).count()
        return Response({"count": count})

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        updated = conversation.messages.filter(read_at__isnull=True).exclude(sender=request.user).update(
            read_at=timezone.now()
        )
        Notification.objects.filter(
            user=request.user,
            kind=Notification.Kind.NEW_MESSAGE,
            target_url=f"/mensagens?conversation={conversation.pk}",
            read_at__isnull=True,
        ).update(read_at=timezone.now())
        return Response({"updated": updated})


class MessageViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ("conversation",)

    def get_queryset(self):
        user = self.request.user
        queryset = Message.objects.select_related("conversation", "sender", "sender__seller_profile")
        if user.is_staff:
            return queryset
        return queryset.filter(Q(conversation__buyer=user) | Q(conversation__seller=user))
