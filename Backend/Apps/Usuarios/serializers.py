from rest_framework import serializers
from Apps.Autenticacion.models import UsuarioPersonalizado
from .models import PerfilUsuario

class UsuarioPersonalizadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioPersonalizado
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'fecha_nacimiento',
            'escuela_profesional',
            'password',
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class FotoPerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['foto_perfil']