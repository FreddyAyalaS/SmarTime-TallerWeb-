from django.db import models
from django.conf import settings

# Modelo de Pregunta del test
class PreguntaPerfil(models.Model):
    TEXTO_METODOS = [
        ('Pomodoro', 'Pomodoro'),
        ('Feynman', 'Feynman'),
        ('Leitner', 'Leitner'),
        ('Pomodoro_Feynman', 'Pomodoro + Feynman'),
        ('Feynman_Pomodoro', 'Feynman + Pomodoro'),
    ]

    texto = models.CharField(max_length=300)
    metodo = models.CharField(max_length=20, choices=TEXTO_METODOS)

    def __str__(self):
        return self.texto

# Modelo de Respuesta del usuario
class RespuestaPerfil(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pregunta = models.ForeignKey(PreguntaPerfil, on_delete=models.CASCADE)
    valor = models.IntegerField()  # 1-5

    def __str__(self):
        return f"{self.usuario.username} - {self.pregunta.id}: {self.valor}"

# Modelo del perfil de aprendizaje calculado
class PerfilAprendizaje(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    metodo_principal = models.CharField(max_length=20)
    metodo_secundario = models.CharField(max_length=20, blank=True, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.usuario.username}: {self.metodo_principal}"


# Modelo de Curso
class Curso(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

# Modelo de Tema
class Tema(models.Model):
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='temas')
    nombre = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.nombre} ({self.curso.nombre})"


# Modelo de Tema con dificultad asignada por el usuario
class TemaDificultad(models.Model):
    DIFICULTAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]
    
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tema = models.ForeignKey(Tema, on_delete=models.CASCADE)
    dificultad = models.CharField(max_length=10, choices=DIFICULTAD_CHOICES)
    metodo_estudio = models.CharField(max_length=20)  # Pomodoro, Feynman, Leitner, etc.
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['usuario', 'tema']
    
    def __str__(self):
        return f"{self.tema.nombre} - {self.usuario.username} ({self.dificultad})"


# Modelo de Sesión de Estudio Generada
class SesionEstudio(models.Model):
    TIPO_SESION_CHOICES = [
        ('estudio', 'Estudio'),
        ('descanso', 'Descanso'),
        ('repaso', 'Repaso'),
    ]
    
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sesiones_estudio')
    tema_dificultad = models.ForeignKey(TemaDificultad, on_delete=models.CASCADE, related_name='sesiones')
    tipo_sesion = models.CharField(max_length=10, choices=TIPO_SESION_CHOICES, default='estudio')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    duracion_minutos = models.IntegerField()
    numero_sesion = models.IntegerField()  # Número de sesión dentro del plan
    completada = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['fecha', 'hora_inicio']
    
    def __str__(self):
        return f"Sesión {self.numero_sesion} - {self.tema_dificultad.tema.nombre} ({self.fecha})"


# Modelo de Planificación Adaptativa
class PlanificacionAdaptativa(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='planificaciones')
    tema_dificultad = models.ForeignKey(TemaDificultad, on_delete=models.CASCADE, related_name='planificaciones')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    total_sesiones = models.IntegerField()
    sesiones_completadas = models.IntegerField(default=0)
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Planificación {self.tema_dificultad.tema.nombre} - {self.usuario.username}"