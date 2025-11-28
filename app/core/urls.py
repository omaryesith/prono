from django.contrib import admin
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
