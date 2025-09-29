from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TareaViewSet, ClaseViewSet, EstudioViewSet, ActividadNoAcademicaViewSet, ActividadesDeHoyAPIView

router = DefaultRouter()
router.register(r'tareas', TareaViewSet, basename='tarea')
router.register(r'clases', ClaseViewSet, basename='clase')
router.register(r'estudios', EstudioViewSet, basename='estudio')
router.register(r'actividadesNoAcademicas', ActividadNoAcademicaViewSet, basename='actividadNoAcademica')



urlpatterns = [
    path('api/', include(router.urls)),
    path('api/actividadesHoy/', ActividadesDeHoyAPIView.as_view(), name='actividadesHoy'), # http://localhost:8000/calendario/api/actividadesHoy/
]
