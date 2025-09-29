from django.urls import path
from .views import CalcularPuntuacionView
from .views import HistorialEstrellasView



urlpatterns = [
    path('api/puntuacionAcumulada/', CalcularPuntuacionView.as_view(), name='puntuacionAcumulada'), # http://localhost:8000/gamificacion/api/puntuacionAcumulada/
    
    path('api/historial-estrellas/', HistorialEstrellasView.as_view(), name='historial-estrellas'),


]
