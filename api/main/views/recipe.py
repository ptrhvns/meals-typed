from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from main.lib.responses import data_response
from main.models import Time
from main.models.equipment import Equipment
from main.models.recipe import Recipe
from main.models.tag import Tag


class EquipmentSerializer(ModelSerializer):
    class Meta:
        model = Equipment
        fields = ("description", "id")


class TagSerializer(ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name")


class TimeSerializer(ModelSerializer):
    class Meta:
        model = Time
        fields = ("category", "days", "hours", "id", "minutes", "note")


class RecipeSerializer(ModelSerializer):
    class Meta:
        model = Recipe
        fields = (
            "equipment",
            "id",
            "notes",
            "rating",
            "servings",
            "tags",
            "times",
            "title",
        )

    equipment = EquipmentSerializer(many=True, required=False)
    tags = TagSerializer(many=True, required=False)
    times = TimeSerializer(many=True, required=False)


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def recipe(request: Request, recipe_id: int) -> Response:
    recipe = get_object_or_404(Recipe, pk=recipe_id, user=request.user)
    serializer = RecipeSerializer(recipe)
    return data_response(data=serializer.data)
