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