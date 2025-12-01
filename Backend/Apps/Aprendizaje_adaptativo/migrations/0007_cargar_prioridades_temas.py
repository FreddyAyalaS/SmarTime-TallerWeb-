from django.db import migrations

def cargar_prioridades(apps, schema_editor):
    Tema = apps.get_model("aprendizaje_adaptativo", "Tema")
    TemaPrioridad = apps.get_model("aprendizaje_adaptativo", "TemaPrioridad")

    prioridades = [
        # Cálculo / Física / Química — 20 temas
        ("Vectores en R3, Producto escalar. Desigualdad de Cauchy-Schwarz", "Feynman", "Pomodoro", "Leitner"),
        ("Ortogonalidad y paralelismo de vectores", "Feynman", "Pomodoro", "Leitner"),
        ("Triple producto escalar. La recta. Ecuaciones vectoriales y paramétricas de una recta", "Feynman", "Pomodoro", "Leitner"),
        ("Los planos. Definiciones y propiedades", "Feynman", "Pomodoro", "Leitner"),
        ("Matrices. Transpuesta de una matriz. Tipos de matrices", "Leitner", "Feynman", "Pomodoro"),

        ("Funciones y gráficos", "Pomodoro", "Feynman", "Leitner"),
        ("Límites", "Pomodoro", "Feynman", "Leitner"),
        ("Derivadas", "Feynman", "Pomodoro", "Leitner"),
        ("Aplicaciones de la derivada", "Feynman", "Pomodoro", "Leitner"),
        ("Introducción a integrales", "Feynman", "Pomodoro", "Leitner"),

        ("Cinemática", "Pomodoro", "Feynman", "Leitner"),
        ("Dinámica", "Feynman", "Pomodoro", "Leitner"),
        ("Trabajo y energía", "Feynman", "Pomodoro", "Leitner"),
        ("Momento y colisiones", "Feynman", "Pomodoro", "Leitner"),
        ("Gravitación", "Feynman", "Pomodoro", "Leitner"),

        ("Estructura atómica", "Leitner", "Feynman", "Pomodoro"),
        ("Tabla periódica", "Leitner", "Feynman", "Pomodoro"),
        ("Enlaces químicos", "Feynman", "Leitner", "Pomodoro"),
        ("Reacciones químicas", "Pomodoro", "Feynman", "Leitner"),
        ("Estequiometría", "Pomodoro", "Leitner", "Feynman"),
    ]

    for nombre, p1, p2, p3 in prioridades:
        try:
            tema = Tema.objects.get(nombre=nombre)
            TemaPrioridad.objects.update_or_create(
                tema=tema,
                defaults={
                    "prioridad_1": p1,
                    "prioridad_2": p2,
                    "prioridad_3": p3,
                }
            )
        except Tema.DoesNotExist:
            print(f"Tema NO encontrado en BD: {nombre}")

def revertir_prioridades(apps, schema_editor):
    TemaPrioridad = apps.get_model("aprendizaje_adaptativo", "TemaPrioridad")
    TemaPrioridad.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ("Aprendizaje_adaptativo", "0006_prioridadmetodotema_recomendacionestudio"),
    ]

    operations = [
        migrations.RunPython(cargar_prioridades, revertir_prioridades),
    ]

    operations = []
