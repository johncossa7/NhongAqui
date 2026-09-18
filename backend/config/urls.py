from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.db import DatabaseError, connection
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from accounts.views import ProfileView, UserViewSet
from categories.views import CategoryViewSet
from favorites.views import FavoriteViewSet
from messaging.views import ConversationViewSet, MessageViewSet
from notifications.views import NotificationViewSet
from products.views import ProductViewSet
from reports.views import ModerationLogViewSet, ReportViewSet, SupportRequestViewSet
from reviews.views import ReviewViewSet
from verification.views import VerificationRequestViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("categories", CategoryViewSet, basename="categories")
router.register("products", ProductViewSet, basename="products")
router.register("favorites", FavoriteViewSet, basename="favorites")
router.register("conversations", ConversationViewSet, basename="conversations")
router.register("messages", MessageViewSet, basename="messages")
router.register("notifications", NotificationViewSet, basename="notifications")
router.register("reviews", ReviewViewSet, basename="reviews")
router.register("reports", ReportViewSet, basename="reports")
router.register("moderation-logs", ModerationLogViewSet, basename="moderation-logs")
router.register("support-requests", SupportRequestViewSet, basename="support-requests")
router.register("verification", VerificationRequestViewSet, basename="verification")


def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError:
        return JsonResponse({"status": "unavailable", "database": "unavailable"}, status=503)
    return JsonResponse({"status": "ok", "database": "ok"})


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/profile/", ProfileView.as_view(), name="profile"),
    path("api/v1/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
elif settings.SERVE_MEDIA_FILES:
    urlpatterns += [
        re_path(
            r"^media/products/(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT / "products"},
        ),
        re_path(
            r"^media/accounts/avatars/(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT / "accounts" / "avatars"},
        ),
    ]
