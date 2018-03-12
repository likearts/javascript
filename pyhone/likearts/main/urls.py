from django.conf.urls import url
from . import views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    url(r'^$', views.main, name='main'),
    url(r'^img/(?P<pk>[0-9]+)/$', views.img, name='img'),
]

# static file view
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)