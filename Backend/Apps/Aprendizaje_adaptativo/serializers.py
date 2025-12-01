from rest_framework import serializers
from .models import (
    PreguntaPerfil, RespuestaPerfil, PerfilAprendizaje,
    Tema, Curso, TemaDificultad, SesionEstudio, PlanificacionAdaptativa,
    RecomendacionMetodoEstudio
)

class PreguntaPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreguntaPerfil
        fields = ['id', 'texto', 'metodo']

class RespuestaPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaPerfil
        fields = ['pregunta', 'valor']

class PerfilAprendizajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilAprendizaje
        fields = ['metodo_principal', 'metodo_secundario', 'fecha_actualizacion']


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = ['id', 'nombre']


class TemaSerializer(serializers.ModelSerializer):
    curso_nombre = serializers.CharField(source='curso.nombre', read_only=True)
    
    class Meta:
        model = Tema
        fields = ['id', 'nombre', 'curso', 'curso_nombre']


class TemaDificultadSerializer(serializers.ModelSerializer):
    tema_nombre = serializers.CharField(source='tema.nombre', read_only=True)
    curso_nombre = serializers.CharField(source='tema.curso.nombre', read_only=True)
    
    class Meta:
        model = TemaDificultad
        fields = ['id', 'tema', 'tema_nombre', 'curso_nombre', 'dificultad', 'fecha_asignacion']
        read_only_fields = ['usuario']


class SesionEstudioSerializer(serializers.ModelSerializer):
    tema_nombre = serializers.CharField(source='tema_dificultad.tema.nombre', read_only=True)
    curso_nombre = serializers.CharField(source='tema_dificultad.tema.curso.nombre', read_only=True)
    dificultad = serializers.CharField(source='tema_dificultad.dificultad', read_only=True)
    
    class Meta:
        model = SesionEstudio
        fields = [
            'id', 'tema_dificultad', 'tema_nombre', 'curso_nombre', 'dificultad',
            'tipo_sesion', 'fecha', 'hora_inicio', 'hora_fin', 'duracion_minutos',
            'numero_sesion', 'completada', 'fecha_creacion'
        ]
        read_only_fields = ['usuario']


class PlanificacionAdaptativaSerializer(serializers.ModelSerializer):
    tema_nombre = serializers.CharField(source='tema_dificultad.tema.nombre', read_only=True)
    curso_nombre = serializers.CharField(source='tema_dificultad.tema.curso.nombre', read_only=True)
    dificultad = serializers.CharField(source='tema_dificultad.dificultad', read_only=True)
    sesiones = SesionEstudioSerializer(many=True, read_only=True, source='tema_dificultad.sesiones')
    
    class Meta:
        model = PlanificacionAdaptativa
        fields = [
            'id', 'tema_dificultad', 'tema_nombre', 'curso_nombre', 'dificultad',
            'fecha_inicio', 'fecha_fin', 'total_sesiones',
            'sesiones_completadas', 'activa', 'fecha_creacion', 'sesiones'
        ]
        read_only_fields = ['usuario', 'total_sesiones', 'sesiones_completadas']


class RecomendacionMetodoEstudioSerializer(serializers.ModelSerializer):
    tema_nombre = serializers.CharField(source='tema.nombre', read_only=True)
    curso_nombre = serializers.CharField(source='tema.curso.nombre', read_only=True)
    
    class Meta:
        model = RecomendacionMetodoEstudio
        fields = [
            'id', 'tema', 'tema_nombre', 'curso_nombre',
            'metodo_principal', 'metodo_complementario',
            'descripcion', 'razon', 'fecha_recomendacion'
        ]
        read_only_fields = ['usuario', 'fecha_recomendacion']
