# Apps.Gamificacion.models

from django.db import models
from django.contrib.auth import get_user_model

class PuntuacionUsuario(models.Model):
    usuario = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='puntuaciones')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estrellas = models.IntegerField()
    completado_todas = models.BooleanField(default=False)

    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.estrellas} estrellas ({self.fecha_inicio} a {self.fecha_fin})"

