from rest_framework import serializers
import re
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueValidator
from .models import UsuarioPersonalizado

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=UsuarioPersonalizado.objects.all(), message="Este correo ya está en uso.")]
    )
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=UsuarioPersonalizado.objects.all(), message="Este nombre de usuario ya existe.")]
    )    
    confirmar_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = UsuarioPersonalizado
        fields = ['first_name', 'username', 'password', 'confirmar_password', 'email', 'fecha_nacimiento', 'escuela_profesional']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        # Validar que el correo termine con @unmsm.edu.pe
        if not value.endswith('@unmsm.edu.pe'):
            raise serializers.ValidationError("El correo debe ser institucional (UNMSM)")
        return value
    
    def validate(self, data):
        required_fields = ['first_name', 'username', 'password','confirmar_password', 'email', 'fecha_nacimiento', 'escuela_profesional']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: 'Este campo es obligatorio.'})
        if data.get('password') != data.get('confirmar_password'):
            raise serializers.ValidationError({"confirmar_password": "Las contraseñas no coinciden."})

        return data

    def validate_password(self, value):
        criterios_password(value)
        return value
    
    
    def create(self, validated_data):
        validated_data.pop('confirmar_password')
        user = UsuarioPersonalizado.objects.create_user(**validated_data)
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=8, max_length=64, write_only=True)
    confirmar_password = serializers.CharField(min_length=8, max_length=64, write_only=True)
    token = serializers.CharField(write_only=True)
    uidb64 = serializers.CharField(write_only=True)
    def validate(self, data):
        if data['password'] != data['confirmar_password']:
            raise serializers.ValidationError({"confirmar_password": "Las contraseñas no coinciden."})
        criterios_password(data['password'])
        return data


def criterios_password(value):
    if len(value) < 8 or len(value) > 20:
        raise serializers.ValidationError("La contraseña debe tener entre 8 y 20 caracteres.")
    if not re.search(r'[A-Z]', value):
        raise serializers.ValidationError("Debe contener al menos una letra mayúscula.")
    if not re.search(r'[a-z]', value):
        raise serializers.ValidationError("Debe contener al menos una letra minúscula.")
    if not re.search(r'\d', value):
        raise serializers.ValidationError("Debe contener al menos un número.")
    if not re.search(r'[!\"#$%&\'()*+,\-./:;<=>?@\[\\\]^_`{|}~]', value):
        raise serializers.ValidationError("Debe contener al menos un carácter especial (!, @, #, etc.).")
    if ' ' in value:
        raise serializers.ValidationError("No se permiten espacios en la contraseña.")