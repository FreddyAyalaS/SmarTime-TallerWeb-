from django.db import models
from django.conf import settings

class PerfilUsuario(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='perfil')
    foto_perfil = models.ImageField(upload_to='fotos_perfil/', null=True, blank=True)

    # Preferencias del usuario
    modo_oscuro = models.BooleanField(default=False)
    notificaciones = models.BooleanField(default=True)
    anti_procrastinacion = models.BooleanField(default=False)
    sugerencias = models.BooleanField(default=True)

    def __str__(self):
        return f'Perfil de {self.usuario.username}'
