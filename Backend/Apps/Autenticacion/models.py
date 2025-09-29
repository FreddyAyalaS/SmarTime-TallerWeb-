from django.db import models
from django.contrib.auth.models import AbstractUser

# todos los campos heredados de AbstractUser + los declarados a continuación


class UsuarioPersonalizado(AbstractUser):
    fecha_nacimiento = models.DateField(null=True, blank=True)
    escuela_profesional = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    notificacion = models.BooleanField(default=True)
    sugerencia = models.BooleanField(default=True)
    score = models.IntegerField(default=0)
