from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path
from ninja_extra import NinjaExtraAPI
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import NinjaJWTDefaultController

from projects.api import projects_router

api = NinjaExtraAPI(title="Prono Real-Time API", version="1.0.0")

api.register_controllers(NinjaJWTDefaultController)
api.add_router("/projects", projects_router, auth=JWTAuth())

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]

if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
