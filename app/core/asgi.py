import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

from core.middleware import JwtAuthMiddleware
from projects.consumers import ProjectConsumer

application = ProtocolTypeRouter(
    {
        # HTTP is handled by Django's ASGI app
        "http": django_asgi_app,
        # WebSockets are handled by JWT auth middleware + router
        "websocket": JwtAuthMiddleware(
            URLRouter(
                [
                    path("ws/projects/<int:project_id>/", ProjectConsumer.as_asgi()),
                ]
            )
        ),
    }
)
