from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.
class Tarea(models.Model):
    ESTADOS = [
        ('inicio', 'Inicio'),
        ('en_desarrollo', 'En desarrollo'),
        ('finalizado', 'Finalizado'),
        ('entregado', 'Entregado'),
    ]

    usuario = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="tareas")
    titulo = models.CharField(max_length=100)
    curso = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    fechaEntrega = models.DateField()
    horaEntrega = models.TimeField()
    fechaRealizacion = models.DateField()
    horaInicio = models.TimeField()
    horaFin = models.TimeField()
    complejidad = models.IntegerField()
    visible = models.BooleanField(default=True)

    # 👉 Nuevo campo de estado:
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='inicio'
    )

    def __str__(self):
        return f"{self.titulo} - {self.usuario.username}"



class Clase(models.Model):
    usuario = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="clases")
    curso = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    fecha = models.DateField()
    horaInicio = models.TimeField()
    horaFin = models.TimeField()
    repetir = models.BooleanField(default=False)  # Solo se activa si el usuario marcó "Repetir"
    semanas = models.IntegerField(null=True, blank=True)  # Solo se activa si repetir=True

    def __str__(self):
        return f"{self.curso} - Clase de {self.usuario.username}"
   

class Estudio(models.Model):
    usuario = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="estudios")
    titulo = models.CharField(max_length=100)
    curso = models.CharField(max_length=100)
    temas = models.TextField(blank=True)
    fecha = models.DateField()
    horaInicio = models.TimeField()
    horaFin = models.TimeField()

    def __str__(self):
        return f"{self.titulo} - Estudio de {self.usuario.username}"



class ActividadNoAcademica(models.Model):
    usuario = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="actividades_no_academicas")
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    fecha = models.DateField()
    horaInicio = models.TimeField()
    horaFin = models.TimeField()
    repetir = models.BooleanField(default=False)  # Solo se activa si el usuario marcó "Repetir"
    semanas = models.IntegerField(null=True, blank=True)  # Solo se activa si repetir=True

    def __str__(self):
        return f"{self.titulo} - {self.usuario}"
