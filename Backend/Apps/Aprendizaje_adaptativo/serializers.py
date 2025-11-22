from rest_framework import serializers
from .models import PreguntaPerfil, RespuestaPerfil, PerfilAprendizaje

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
