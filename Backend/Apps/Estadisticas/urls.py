from django.urls import path
from .views import EstadoTareasView

urlpatterns = [
    path('api/estadoTareasSemanal/', EstadoTareasView.as_view(), name='estado-tareas-semanal'), # GET http://localhost:8000/estadisticas/api/estadoTareasSemanal/

]
