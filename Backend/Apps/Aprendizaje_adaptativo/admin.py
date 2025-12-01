from django.contrib import admin
from .models import (
    PreguntaPerfil, RespuestaPerfil, PerfilAprendizaje,
    Curso, Tema, TemaDificultad, SesionEstudio, PlanificacionAdaptativa
)


@admin.register(PreguntaPerfil)
class PreguntaPerfilAdmin(admin.ModelAdmin):
    list_display = ['id', 'texto', 'metodo']
    list_filter = ['metodo']
    search_fields = ['texto']


@admin.register(RespuestaPerfil)
class RespuestaPerfilAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'pregunta', 'valor']
    list_filter = ['usuario']
    search_fields = ['usuario__username']


@admin.register(PerfilAprendizaje)
class PerfilAprendizajeAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'metodo_principal', 'metodo_secundario', 'fecha_actualizacion']
    list_filter = ['metodo_principal']
    search_fields = ['usuario__username']


@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre']
    search_fields = ['nombre']


@admin.register(Tema)
class TemaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'curso']
    list_filter = ['curso']
    search_fields = ['nombre', 'curso__nombre']


@admin.register(TemaDificultad)
class TemaDificultadAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'tema', 'dificultad', 'fecha_asignacion']
    list_filter = ['dificultad']
    search_fields = ['usuario__username', 'tema__nombre']
    date_hierarchy = 'fecha_asignacion'


@admin.register(SesionEstudio)
class SesionEstudioAdmin(admin.ModelAdmin):
    list_display = ['numero_sesion', 'usuario', 'tema_dificultad', 'tipo_sesion', 
                    'fecha', 'hora_inicio', 'hora_fin', 'duracion_minutos', 'completada']
    list_filter = ['tipo_sesion', 'completada', 'usuario', 'fecha']
    search_fields = ['usuario__username', 'tema_dificultad__tema__nombre']
    date_hierarchy = 'fecha'
    ordering = ['fecha', 'hora_inicio']


@admin.register(PlanificacionAdaptativa)
class PlanificacionAdaptativaAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'tema_dificultad', 'fecha_inicio', 'fecha_fin',
                    'total_sesiones', 'sesiones_completadas', 'activa', 'fecha_creacion']
    list_filter = ['activa', 'usuario', 'fecha_inicio']
    search_fields = ['usuario__username', 'tema_dificultad__tema__nombre']
    date_hierarchy = 'fecha_creacion'
    readonly_fields = ['fecha_creacion']

