from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from ninja_jwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def get_user(token_key):
    try:
        # Validate token using ninja-jwt library
        access_token = AccessToken(token_key)
        user_id = access_token["user_id"]
        return User.objects.get(id=user_id)
    except Exception as e:
        # Invalid or expired token
        return AnonymousUser()


class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Parse query string
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)

        # Get token if exists
        token_key = query_params.get("token", [None])[0]

        # Authenticate
        if token_key:
            scope["user"] = await get_user(token_key)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
