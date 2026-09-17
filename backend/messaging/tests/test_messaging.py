import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.models import SellerProfile, UserBlock
from categories.models import Category
from messaging.models import Conversation, Message
from notifications.models import Notification
from products.models import Product

User = get_user_model()


@pytest.mark.django_db
def test_conversation_is_unique_and_private():
    seller = User.objects.create_user(email="seller@example.com", password="Password123!")
    buyer = User.objects.create_user(email="buyer@example.com", password="Password123!")
    stranger = User.objects.create_user(email="stranger@example.com", password="Password123!")
    for user in [seller, buyer, stranger]:
        SellerProfile.objects.create(user=user, display_name=user.email)
    category = Category.objects.create(name="Eletronica")
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="TV Samsung",
        description="43 polegadas.",
        price="24000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Matola",
        status=Product.Status.ACTIVE,
    )

    client = APIClient()
    client.force_authenticate(buyer)
    first = client.post("/api/v1/conversations/", {"product_id": product.id}, format="json")
    second = client.post("/api/v1/conversations/", {"product_id": product.id}, format="json")
    assert first.status_code == 201
    assert second.status_code == 201
    assert Conversation.objects.count() == 1

    client.force_authenticate(stranger)
    response = client.get(f"/api/v1/conversations/{first.data['id']}/")
    assert response.status_code == 404

    client.force_authenticate(buyer)
    sent = client.post(
        "/api/v1/messages/",
        {"conversation_id": first.data["id"], "content": "Ainda esta disponivel?"},
        format="json",
    )
    assert sent.status_code == 201
    notification = Notification.objects.get(user=seller, kind=Notification.Kind.NEW_MESSAGE)
    assert notification.data["message_id"] == sent.data["id"]

    client.force_authenticate(seller)
    unread = client.get("/api/v1/conversations/unread-count/")
    assert unread.status_code == 200
    assert unread.data["count"] == 1
    conversations = client.get("/api/v1/conversations/")
    assert conversations.data["results"][0]["unread_count"] == 1

    marked = client.post(f"/api/v1/conversations/{first.data['id']}/mark-read/")
    assert marked.status_code == 200
    assert marked.data["updated"] == 1
    assert Message.objects.get(pk=sent.data["id"]).read_at is not None
    notification.refresh_from_db()
    assert notification.read_at is not None


@pytest.mark.django_db
def test_notifications_are_private_and_can_be_marked_read():
    owner = User.objects.create_user(email="notice-owner@example.com", password="Password123!")
    stranger = User.objects.create_user(email="notice-stranger@example.com", password="Password123!")
    notification = Notification.objects.create(user=owner, title="Aviso", body="Teste")
    client = APIClient()
    client.force_authenticate(stranger)
    stranger_list = client.get("/api/v1/notifications/")
    assert stranger_list.status_code == 200
    assert stranger_list.data["count"] == 0
    assert client.post(f"/api/v1/notifications/{notification.id}/mark-read/").status_code == 404

    client.force_authenticate(owner)
    marked = client.post(f"/api/v1/notifications/{notification.id}/mark-read/")
    assert marked.status_code == 200
    assert marked.data["read_at"] is not None


@pytest.mark.django_db
def test_blocked_users_cannot_start_conversations():
    seller = User.objects.create_user(email="blocked-seller@example.com", password="Password123!")
    buyer = User.objects.create_user(email="blocked-buyer@example.com", password="Password123!")
    SellerProfile.objects.create(user=seller, display_name="Seller")
    SellerProfile.objects.create(user=buyer, display_name="Buyer")
    UserBlock.objects.create(blocker=seller, blocked=buyer)
    category = Category.objects.create(name="Bloqueios")
    product = Product.objects.create(
        seller=seller,
        category=category,
        title="Produto bloqueado",
        description="Descricao.",
        price="1000.00",
        condition=Product.Condition.GOOD,
        province="Maputo",
        city="Maputo",
        status=Product.Status.ACTIVE,
    )
    client = APIClient()
    client.force_authenticate(buyer)

    response = client.post("/api/v1/conversations/", {"product_id": product.id}, format="json")

    assert response.status_code == 400
    assert Conversation.objects.count() == 0
