from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwnerOrAdminOrReadOnly(BasePermission):
    owner_field = "user"

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        if request.user and request.user.is_staff:
            return True
        owner = getattr(obj, self.owner_field, None)
        return owner == request.user


class IsSellerOrAdminOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        if request.user and request.user.is_staff:
            return True
        return getattr(obj, "seller_id", None) == request.user.id


class IsParticipant(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        if request.user and request.user.is_staff:
            return True
        return obj.buyer_id == request.user.id or obj.seller_id == request.user.id
