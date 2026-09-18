from unittest.mock import patch

import pytest
from django.db import DatabaseError
from django.test import Client


@pytest.mark.django_db
def test_health_check_confirms_database_connection():
    response = Client().get("/health/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


@pytest.mark.django_db
def test_health_check_returns_unavailable_when_database_fails():
    with patch("config.urls.connection.cursor", side_effect=DatabaseError):
        response = Client().get("/health/")

    assert response.status_code == 503
    assert response.json() == {"status": "unavailable", "database": "unavailable"}
