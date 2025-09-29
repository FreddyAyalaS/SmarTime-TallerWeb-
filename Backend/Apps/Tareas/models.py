from django.db import models
from Apps.Calendario.models import Tarea


class EstadoTarea(models.Model):
    ESTADOS = [
        ('inicio', 'Inicio'),
        ('en_desarrollo', 'En desarrollo'),
        ('finalizado', 'Finalizado'),
        ('entregado', 'Entregado'),
    ]

    tarea = models.OneToOneField(Tarea, on_delete=models.CASCADE, related_name='estado_actual')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='inicio')
    fecha_estado = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tarea.titulo} - {self.estado}"

