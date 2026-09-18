import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

User = get_user_model()


@pytest.mark.django_db(transaction=True)
def test_purge_demo_data_only_removes_known_demo_accounts():
    User.objects.create_user(email="vendedor1@nhongaqui.local", password="Password123!")
    real_user = User.objects.create_user(email="real@example.com", password="Password123!")

    call_command("purge_demo_data")

    assert not User.objects.filter(email="vendedor1@nhongaqui.local").exists()
    assert User.objects.filter(pk=real_user.pk).exists()
