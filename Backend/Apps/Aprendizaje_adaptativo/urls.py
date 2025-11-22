# Apps/Aprendizaje_adaptativo/urls.py
from django.urls import path
from .views import TestPerfilView

urlpatterns = [
    path('perfil/', TestPerfilView.as_view(), name='test-perfil'), # http://localhost:8000/aprendizaje_adaptativo/perfil/
]
