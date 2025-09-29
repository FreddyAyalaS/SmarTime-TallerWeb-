from django.urls import path
from .views import ActualizarEstadoPorTareaView, OcultarTareaView
from .views import TareasCompletadasPendientesView


urlpatterns = [
    path('api/estadoTarea/<int:tarea_id>/actualizarEstado/', ActualizarEstadoPorTareaView.as_view(), name='actualizar-estado-por-tarea'), # PATCH http://localhost:8000/tareas/api/estadoTarea/<tarea_id>/actualizarEstado/
    path('api/visibilidadTarea/<int:tarea_id>/ocultarTarea/', OcultarTareaView.as_view(), name='ocultar-tarea'), # PATCH http://localhost:8000/tareas/api/visibilidadTarea/<tarea_id>/ocultarTarea/

    path('api/tareas-completadas-pendientes/', TareasCompletadasPendientesView.as_view(), name='tareas-completadas-pendientes'),




]
