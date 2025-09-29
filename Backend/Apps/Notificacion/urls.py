from django.urls import path
from .views import (
    enviar_recordatorios,
    notificar_tareas_fin,
    notificar_tareas_pendientes,
)

urlpatterns = [
    path("recordatorio-matutino/", enviar_recordatorios),
    path("recordatorio-2h/", notificar_tareas_fin),
    path("tarea-expirada/", notificar_tareas_pendientes),
]
