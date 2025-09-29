import django
import os

# Configura el entorno de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SmarTime.settings")
django.setup()

from Apps.Calendario.models import (
    Tarea,
    Clase,
    Estudio,
    ActividadNoAcademica,
)
from Apps.Tareas.models import EstadoTarea
from django.contrib.auth import get_user_model
from datetime import date, time, timedelta

User = get_user_model()

u = User.objects.first()

hoy = date.today()

# Crear 5 tareas por usuario
tareas = []
for i in range(1, 6):
    tarea = Tarea.objects.create(
        usuario=u,
        titulo=f"Tarea {i} de {u.first_name}",
        curso=f"Curso {i}",
        descripcion=f"Descripción de la tarea {i}",
        fechaEntrega=hoy + timedelta(days=i),
        horaEntrega=time(23, 59),
        fechaRealizacion=hoy + timedelta(days=i - 1),
        horaInicio=time(14, 0),
        horaFin=time(15, 0),
        complejidad=i,
    )
    tareas.append(tarea)

for i in range(1, 6):
    estado = EstadoTarea.objects.create(
        tarea=tareas[i - 1],
        estado="inicio" if i % 2 == 0 else "en_desarrollo",
    )

# Crear 5 clases por usuario
for i in range(1, 6):
    Clase.objects.create(
        usuario=u,
        curso=f"Curso Clase {i}",
        descripcion=f"Descripción clase {i}",
        fecha=hoy + timedelta(days=i),
        horaInicio=time(8 + i, 0),
        horaFin=time(9 + i, 0),
        repetir=(i % 2 == 0),
        semanas=i if i % 2 == 0 else None,
    )

# Crear 5 sesiones de estudio por usuario

for i in range(1, 6):
    Estudio.objects.create(
        usuario=u,
        titulo=f"Estudio {i}",
        curso=f"Curso Estudio {i}",
        temas=f"Temas {i}",
        fecha=hoy + timedelta(days=i),
        horaInicio=time(10 + i, 0),
        horaFin=time(11 + i, 0),
    )

# Crear 5 actividades no académicas por usuario
for i in range(1, 6):
    ActividadNoAcademica.objects.create(
        usuario=u,
        titulo=f"Actividad No Académica {i}",
        descripcion=f"Descripción {i}",
        fecha=hoy + timedelta(days=i),
        horaInicio=time(17 + i, 0),
        horaFin=time(18 + i, 0),
        repetir=(i % 2 == 1),
        semanas=i if i % 2 == 1 else None,
    )

print("✅ Se cargaron los datos de prueba.")
