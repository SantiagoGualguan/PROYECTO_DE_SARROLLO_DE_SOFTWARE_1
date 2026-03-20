from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.auth_urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/choreographies/', include('apps.choreographies.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/sales/', include('apps.sales.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

