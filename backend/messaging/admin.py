from django.contrib import admin

from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("product", "buyer", "seller", "last_message_at", "created_at")
    search_fields = ("product__title", "buyer__email", "seller__email")
    readonly_fields = ("created_at", "updated_at", "last_message_at")
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender", "created_at", "read_at")
    search_fields = ("content", "sender__email", "conversation__product__title")
    readonly_fields = ("created_at",)
