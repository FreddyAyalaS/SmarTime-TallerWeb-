import django
import os

# Configura el entorno de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SmarTime.settings")
django.setup()

from Apps.Notificacion.models import Tarea, Usuario
from Apps.Notificacion.utils import sugerencia_actividad

# Suponiendo que ya tienes usuarios y tareas en la base de datos
usuario = Usuario.objects.first()

# Crear tarea nueva (sin guardar aún)
from datetime import date, time

tarea_nueva = Tarea.objects.create(
    usuario=usuario,
    titulo="Tarea Prueba",
    curso="Matemáticas",
    descripcion="Tarea para pruebas",
    fechaEntrega=date(2025, 7, 10),
    horaEntrega=time(10, 0),
    fechaRealizacion=date(2025, 7, 1),
    horaInicio=time(8, 0),
    horaFin=time(11, 0),
    complejidad=3,
)

# Ejecutar la función de prueba
sugerencia_actividad(usuario, tarea_nueva)

print("Prueba completada. Revisa los registros para ver las sugerencias enviadas.")
