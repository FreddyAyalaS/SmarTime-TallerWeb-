from django.urls import path
from .views import UserMeView
from .views import UserMeView
from .views import UserMeView
from .views import FotoPerfilView

urlpatterns = [
    path('me/', UserMeView.as_view(), name='user-me'),
    path('me/foto/', FotoPerfilView.as_view(), name='user-foto'),

]
