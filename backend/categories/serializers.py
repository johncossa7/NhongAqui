from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "parent", "sort_order", "is_active", "children"]
        read_only_fields = ["id", "slug", "children"]

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by("sort_order", "name")
        return CategorySerializer(children, many=True, context=self.context).data
