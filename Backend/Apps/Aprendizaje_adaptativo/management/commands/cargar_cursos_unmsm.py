"""
Management command para cargar cursos y temas de Ingeniería de Software UNMSM
Primeros 2 ciclos de la malla curricular
"""
from django.core.management.base import BaseCommand
from Apps.Aprendizaje_adaptativo.models import Curso, Tema


class Command(BaseCommand):
    help = 'Carga cursos y temas de Ingeniería de Software UNMSM (Ciclos 1 y 2)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Cargando cursos y temas de UNMSM...'))

        # Datos de la malla curricular de Ingeniería de Software UNMSM
        cursos_data = {
            # CICLO 1
            'Matemática Básica': [
                'Lógica proposicional',
                'Conjuntos',
                'Números reales',
                'Ecuaciones e inecuaciones',
                'Funciones reales',
                'Límites y continuidad',
            ],
            'Cálculo I': [
                'Límites',
                'Continuidad',
                'Derivadas',
                'Aplicaciones de la derivada',
                'Integrales indefinidas',
                'Integrales definidas',
            ],
            'Álgebra Lineal': [
                'Matrices',
                'Determinantes',
                'Sistemas de ecuaciones lineales',
                'Espacios vectoriales',
                'Transformaciones lineales',
                'Valores y vectores propios',
            ],
            'Introducción a la Programación': [
                'Variables y tipos de datos',
                'Estructuras de control',
                'Funciones',
                'Arreglos',
                'Cadenas de caracteres',
                'Archivos',
            ],
            'Física I': [
                'Cinemática',
                'Dinámica',
                'Trabajo y energía',
                'Cantidad de movimiento',
                'Rotación',
                'Gravitación',
            ],
            'Técnicas de Estudio': [
                'Hábitos de estudio',
                'Técnicas de lectura',
                'Toma de apuntes',
                'Gestión del tiempo',
                'Técnicas de memorización',
                'Preparación para exámenes',
            ],

            # CICLO 2
            'Cálculo II': [
                'Integrales múltiples',
                'Series infinitas',
                'Ecuaciones paramétricas',
                'Coordenadas polares',
                'Funciones vectoriales',
                'Campos vectoriales',
            ],
            'Física II': [
                'Electrostática',
                'Potencial eléctrico',
                'Corriente y resistencia',
                'Circuitos eléctricos',
                'Campo magnético',
                'Inducción electromagnética',
            ],
            'Algoritmia': [
                'Análisis de algoritmos',
                'Complejidad computacional',
                'Recursividad',
                'Algoritmos de búsqueda',
                'Algoritmos de ordenamiento',
                'Divide y vencerás',
            ],
            'Estructuras de Datos': [
                'Pilas y colas',
                'Listas enlazadas',
                'Árboles binarios',
                'Árboles de búsqueda',
                'Grafos',
                'Tablas hash',
            ],
            'Química General': [
                'Estructura atómica',
                'Tabla periódica',
                'Enlaces químicos',
                'Reacciones químicas',
                'Estequiometría',
                'Soluciones',
            ],
            'Lenguaje y Comunicación': [
                'Comunicación oral',
                'Comunicación escrita',
                'Redacción académica',
                'Argumentación',
                'Presentaciones efectivas',
                'Trabajo en equipo',
            ],
        }

        # Contador de cursos y temas creados
        cursos_creados = 0
        temas_creados = 0

        # Crear cursos y temas
        for nombre_curso, temas in cursos_data.items():
            # Verificar si el curso ya existe
            curso, created = Curso.objects.get_or_create(nombre=nombre_curso)
            
            if created:
                cursos_creados += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Curso creado: {nombre_curso}'))
            else:
                self.stdout.write(self.style.WARNING(f'○ Curso ya existe: {nombre_curso}'))

            # Crear temas para este curso
            for nombre_tema in temas:
                tema, created = Tema.objects.get_or_create(
                    curso=curso,
                    nombre=nombre_tema
                )
                
                if created:
                    temas_creados += 1
                    self.stdout.write(f'  - Tema creado: {nombre_tema}')

        # Resumen
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS(f'RESUMEN:'))
        self.stdout.write(self.style.SUCCESS(f'Cursos creados: {cursos_creados}'))
        self.stdout.write(self.style.SUCCESS(f'Temas creados: {temas_creados}'))
        self.stdout.write(self.style.SUCCESS(f'Total de cursos en BD: {Curso.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Total de temas en BD: {Tema.objects.count()}'))
        self.stdout.write(self.style.SUCCESS('='*60))
