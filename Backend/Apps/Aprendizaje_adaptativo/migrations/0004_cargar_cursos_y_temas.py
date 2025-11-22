from django.db import migrations

def cargar_cursos_y_temas(apps, schema_editor):
    Curso = apps.get_model("Aprendizaje_adaptativo", "Curso")
    Tema = apps.get_model("Aprendizaje_adaptativo", "Tema")

    cursos_y_temas = {
        "Matemática Básica": [
            "Vectores en R3, Producto escalar. Desigualdad de Cauchy-Schwarz",
            "Ortogonalidad y paralelismo de vectores",
            "Triple producto escalar. La recta. Ecuaciones vectoriales y paramétricas de una recta",
            "Los planos. Definiciones y propiedades",
            "Matrices. Transpuesta de una matriz. Tipos de matrices"
        ],
        "Cálculo I": [
            "Funciones y gráficos",
            "Límites",
            "Derivadas",
            "Aplicaciones de la derivada",
            "Introducción a integrales"
        ],
        "Física": [
            "Cinemática",
            "Dinámica",
            "Trabajo y energía",
            "Momento y colisiones",
            "Gravitación"
        ],
        "Química": [
            "Estructura atómica",
            "Tabla periódica",
            "Enlaces químicos",
            "Reacciones químicas",
            "Estequiometría"
        ]
    }

    for nombre_curso, temas in cursos_y_temas.items():
        curso_obj, _ = Curso.objects.update_or_create(nombre=nombre_curso)
        for nombre_tema in temas:
            Tema.objects.update_or_create(curso=curso_obj, nombre=nombre_tema)

def revertir_cursos_y_temas(apps, schema_editor):
    Curso = apps.get_model("Aprendizaje_adaptativo", "Curso")
    Curso.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ("Aprendizaje_adaptativo", "0003_curso_tema"),
    ]

    operations = [
        migrations.RunPython(cargar_cursos_y_temas, revertir_cursos_y_temas),
    ]
