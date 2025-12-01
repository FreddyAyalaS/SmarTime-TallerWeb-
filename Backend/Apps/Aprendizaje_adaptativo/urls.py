# Apps/Aprendizaje_adaptativo/urls.py
from django.urls import path
from .views import (
    TestPerfilView, CursoTemaView, TemaDificultadView,
    GenerarPlanificacionView, PlanificacionesView, SesionesEstudioView,
    RecomendarMetodoAPIView
    TestPerfilView, PerfilAprendizajeView, CursoTemaView, TemaDificultadView,
    GenerarPlanificacionView, PlanificacionesView, SesionesEstudioView
)


urlpatterns = [
    path('perfil/', TestPerfilView.as_view(), name='test-perfil'), 
    # http://localhost:8000/aprendizaje_adaptativo/perfil/
    
    path('perfil-usuario/', PerfilAprendizajeView.as_view(), name='perfil-usuario'),
    # http://localhost:8000/aprendizaje_adaptativo/perfil-usuario/
    
    path('cursos-temas/', CursoTemaView.as_view(), name='cursos-temas'),
    # http://localhost:8000/aprendizaje_adaptativo/cursos-temas/
    
    path('tema-dificultad/', TemaDificultadView.as_view(), name='tema-dificultad'),
    # http://localhost:8000/aprendizaje_adaptativo/tema-dificultad/
    
    path('generar-planificacion/', GenerarPlanificacionView.as_view(), name='generar-planificacion'),
    # http://localhost:8000/aprendizaje_adaptativo/generar-planificacion/
    
    path('planificaciones/', PlanificacionesView.as_view(), name='planificaciones'),
    # http://localhost:8000/aprendizaje_adaptativo/planificaciones/
    
    path('sesiones/', SesionesEstudioView.as_view(), name='sesiones-estudio'),
    # http://localhost:8000/aprendizaje_adaptativo/sesiones/
    
    path('sesiones/<int:pk>/', SesionesEstudioView.as_view(), name='sesiones-estudio-detalle'),
    # http://localhost:8000/aprendizaje_adaptativo/sesiones/<id>/
    
    path("recomendar-metodo/", RecomendarMetodoAPIView.as_view(), name="recomendar-metodo"),
    # http://localhost:8000/aprendizaje_adaptativo/recomendar-metodo/

]
