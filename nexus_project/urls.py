from django.contrib import admin
from django.urls import path, include, re_path # Import re_path
from rest_framework import permissions # Import permissions
from drf_yasg.views import get_schema_view # Import get_schema_view
from drf_yasg import openapi # Import openapi
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views # Import the new views file

schema_view = get_schema_view(
   openapi.Info(
      title="Poll System API",
      default_version='v1',
      description="API for managing online polls, voting, and real-time results.",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@polls.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('polls.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Swagger UI and ReDoc URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', views.home_view, name='home'),
]