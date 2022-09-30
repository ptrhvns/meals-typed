from django.db.models.functions import Length
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from main.lib.client import MAX_AUTOCOMPLETE_MATCHES
from main.lib.responses import data_response
from main.models.unit import Unit


@api_view(http_method_names=["GET"])
@permission_classes([IsAuthenticated])
def unit_search(request: Request) -> Response:
    if not (search_term := request.query_params.get("search_term")):
        return data_response(data={"matches": []})

    unit = Unit.objects.filter(name__icontains=search_term, user=request.user).order_by(
        Length("name").asc()
    )[:MAX_AUTOCOMPLETE_MATCHES]

    return data_response(data={"matches": [u.name for u in unit]})
