from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from .models import (
    PreguntaPerfil, RespuestaPerfil, PerfilAprendizaje,
    Tema, Curso, TemaDificultad, SesionEstudio, PlanificacionAdaptativa,
    RecomendacionMetodoEstudio
)
from .serializers import (
    PreguntaPerfilSerializer, RespuestaPerfilSerializer, PerfilAprendizajeSerializer,
    TemaSerializer, CursoSerializer, TemaDificultadSerializer,
    SesionEstudioSerializer, PlanificacionAdaptativaSerializer,
    RecomendacionMetodoEstudioSerializer
)
from django.db.models import Sum
from datetime import datetime, timedelta, time
import math


# Configuración de parámetros por método de estudio y dificultad
METODOS_CONFIG = {
    'Pomodoro': {
        'duracion_estudio': 25,
        'duracion_descanso_corto': 5,
        'duracion_descanso_largo': 15,
        'sesiones_por_ciclo': 4,
    },
    'Feynman': {
        'duracion_estudio': 30,
        'duracion_descanso': 10,
        'sesiones_por_ciclo': 3,
    },
    'Leitner': {
        'duracion_estudio': 20,
        'duracion_descanso': 5,
        'sesiones_por_ciclo': 5,
    },
}

# Pesos por dificultad (para cálculo de tiempo total)
PESOS_DIFICULTAD = {
    'baja': 0.5,
    'media': 1.0,
    'alta': 1.5,
}

# Tiempo base en minutos (ejemplo: 2.5 horas)
TIEMPO_BASE_MINUTOS = 150

# Tabla de prioridades: qué método funciona mejor para cada tipo de tema
# Prioridad: 1 (mejor) a 3 (menos recomendado)
PRIORIDADES_METODO_POR_TEMA = {
    # Temas matemáticos y lógicos
    'matrices': {'Pomodoro': 1, 'Leitner': 2, 'Feynman': 3},
    'determinantes': {'Pomodoro': 1, 'Leitner': 2, 'Feynman': 3},
    'derivadas': {'Pomodoro': 1, 'Leitner': 2, 'Feynman': 3},
    'integrales': {'Pomodoro': 1, 'Leitner': 2, 'Feynman': 3},
    'ecuaciones': {'Pomodoro': 1, 'Leitner': 2, 'Feynman': 3},
    'algoritmos': {'Pomodoro': 1, 'Feynman': 2, 'Leitner': 3},
    'complejidad': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    
    # Temas conceptuales que requieren comprensión profunda
    'lógica': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'espacios vectoriales': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'transformaciones': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'cinemática': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'dinámica': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'electrostática': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'recursividad': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'grafos': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'árboles': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    
    # Temas de memorización
    'tabla periódica': {'Leitner': 1, 'Pomodoro': 2, 'Feynman': 3},
    'vocabulario': {'Leitner': 1, 'Pomodoro': 2, 'Feynman': 3},
    'fórmulas': {'Leitner': 1, 'Pomodoro': 2, 'Feynman': 3},
    'fechas': {'Leitner': 1, 'Pomodoro': 2, 'Feynman': 3},
    'definiciones': {'Leitner': 1, 'Feynman': 2, 'Pomodoro': 3},
    
    # Temas prácticos/programación
    'programación': {'Pomodoro': 1, 'Feynman': 2, 'Leitner': 3},
    'funciones': {'Pomodoro': 1, 'Feynman': 2, 'Leitner': 3},
    'arreglos': {'Pomodoro': 1, 'Leitner': 2, 'Feynman': 3},
    'estructuras de control': {'Pomodoro': 1, 'Feynman': 2, 'Leitner': 3},
    'pilas': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'colas': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
    'listas enlazadas': {'Feynman': 1, 'Pomodoro': 2, 'Leitner': 3},
}

# Sesiones base recomendadas
SESIONES_BASE = 6


class TestPerfilView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Devuelve todas las preguntas del test"""
        preguntas = PreguntaPerfil.objects.all()
        serializer = PreguntaPerfilSerializer(preguntas, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Recibe respuestas y calcula perfil de aprendizaje"""
        respuestas = request.data.get('respuestas', [])
        if not respuestas:
            return Response({"error": "No se enviaron respuestas"}, status=status.HTTP_400_BAD_REQUEST)

        # Guardar respuestas
        for r in respuestas:
            pregunta_id = r.get('pregunta')
            valor = r.get('valor')
            if pregunta_id is None or valor is None:
                continue
            RespuestaPerfil.objects.update_or_create(
                usuario=request.user,
                pregunta_id=pregunta_id,
                defaults={'valor': valor}
            )

        # Calcular puntajes por método
        puntajes = {'Pomodoro': 0, 'Feynman': 0, 'Leitner': 0}
        for r in respuestas:
            try:
                pregunta = PreguntaPerfil.objects.get(id=r['pregunta'])
                valor = int(r['valor'])
                if pregunta.metodo in ['Pomodoro', 'Feynman', 'Leitner']:
                    puntajes[pregunta.metodo] += valor
                elif pregunta.metodo == 'Pomodoro_Feynman' or pregunta.metodo == 'Feynman_Pomodoro':
                    puntajes['Pomodoro'] += valor / 2
                    puntajes['Feynman'] += valor / 2
            except PreguntaPerfil.DoesNotExist:
                continue

        # Determinar método principal y secundario
        sorted_puntajes = sorted(puntajes.items(), key=lambda x: x[1], reverse=True)
        metodo_principal = sorted_puntajes[0][0]
        metodo_secundario = sorted_puntajes[1][0] if sorted_puntajes[1][1] > 0 else None

        perfil, _ = PerfilAprendizaje.objects.update_or_create(
            usuario=request.user,
            defaults={
                'metodo_principal': metodo_principal,
                'metodo_secundario': metodo_secundario
            }
        )

        serializer = PerfilAprendizajeSerializer(perfil)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PerfilAprendizajeView(APIView):
    """Vista para obtener el perfil de aprendizaje del usuario actual"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Obtiene el perfil de aprendizaje del usuario actual"""
        try:
            perfil = PerfilAprendizaje.objects.get(usuario=request.user)
            serializer = PerfilAprendizajeSerializer(perfil)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PerfilAprendizaje.DoesNotExist:
            return Response({"error": "No se encontró un perfil de aprendizaje"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Recibe respuestas y calcula perfil de aprendizaje"""
        respuestas = request.data.get('respuestas', [])
        if not respuestas:
            return Response({"error": "No se enviaron respuestas"}, status=status.HTTP_400_BAD_REQUEST)

        # Guardar respuestas
        for r in respuestas:
            pregunta_id = r.get('pregunta')
            valor = r.get('valor')
            RespuestaPerfil.objects.update_or_create(
                usuario=request.user,
                pregunta_id=pregunta_id,
                defaults={'valor': valor}
            )

        # Calcular puntajes por método
        puntajes = {'Pomodoro': 0, 'Feynman': 0, 'Leitner': 0}
        for r in respuestas:
            pregunta = PreguntaPerfil.objects.get(id=r['pregunta'])
            valor = int(r['valor'])
            if pregunta.metodo in ['Pomodoro', 'Feynman', 'Leitner']:
                puntajes[pregunta.metodo] += valor
            elif pregunta.metodo == 'Pomodoro_Feynman' or pregunta.metodo == 'Feynman_Pomodoro':
                puntajes['Pomodoro'] += valor / 2
                puntajes['Feynman'] += valor / 2

        # Determinar método principal y secundario
        sorted_puntajes = sorted(puntajes.items(), key=lambda x: x[1], reverse=True)
        metodo_principal = sorted_puntajes[0][0]
        metodo_secundario = sorted_puntajes[1][0] if sorted_puntajes[1][1] > 0 else None

        perfil, _ = PerfilAprendizaje.objects.update_or_create(
            usuario=request.user,
            defaults={
                'metodo_principal': metodo_principal,
                'metodo_secundario': metodo_secundario
            }
        )

        serializer = PerfilAprendizajeSerializer(perfil)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CursoTemaView(APIView):
    """Vista para listar cursos y temas"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        cursos = Curso.objects.all()
        temas = Tema.objects.all()
        
        return Response({
            'cursos': CursoSerializer(cursos, many=True).data,
            'temas': TemaSerializer(temas, many=True).data,
        })


class RecomendacionMetodoView(APIView):
    """Vista para recibir método de estudio personalizado (HU-20)"""
    permission_classes = [permissions.IsAuthenticated]
    
    # Descripciones de métodos
    DESCRIPCIONES_METODOS = {
        'Pomodoro': {
            'descripcion': 'Técnica de gestión del tiempo que divide el trabajo en intervalos de 25 minutos (pomodoros) con descansos cortos de 5 minutos. Ideal para mantener la concentración y evitar la fatiga mental.',
            'caracteristicas': 'Ideal para tareas que requieren concentración sostenida y control del tiempo.'
        },
        'Feynman': {
            'descripcion': 'Método de aprendizaje basado en explicar conceptos de manera simple, como si se le enseñara a alguien sin conocimientos previos. Promueve la comprensión profunda y la identificación de vacíos en el conocimiento.',
            'caracteristicas': 'Excelente para temas conceptuales que requieren comprensión profunda.'
        },
        'Leitner': {
            'descripcion': 'Sistema de repetición espaciada que usa tarjetas (flashcards) organizadas en cajas. Las tarjetas se revisan con mayor frecuencia según su dificultad. Efectivo para memorización y consolidación de conocimientos.',
            'caracteristicas': 'Perfecto para memorizar vocabulario, fórmulas, fechas y datos específicos.'
        },
    }
    
    def post(self, request):
        """Genera una recomendación de método de estudio para un tema específico"""
        tema_id = request.data.get('tema_id')
        
        if not tema_id:
            return Response(
                {"error": "Se requiere tema_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el tema existe
        try:
            tema = Tema.objects.get(id=tema_id)
        except Tema.DoesNotExist:
            return Response(
                {"error": "Tema no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener perfil de aprendizaje del usuario
        try:
            perfil = PerfilAprendizaje.objects.get(usuario=request.user)
            metodo_principal_perfil = perfil.metodo_principal
            metodo_secundario_perfil = perfil.metodo_secundario
        except PerfilAprendizaje.DoesNotExist:
            # Si no hay perfil, usar recomendación genérica
            metodo_principal_perfil = 'Pomodoro'
            metodo_secundario_perfil = None
        
        # Obtener dificultad del tema si existe
        try:
            tema_dificultad = TemaDificultad.objects.get(usuario=request.user, tema=tema)
            dificultad = tema_dificultad.dificultad
        except TemaDificultad.DoesNotExist:
            dificultad = 'media'  # Por defecto
        
        # Generar recomendación basada en perfil y tema
        recomendacion = self._generar_recomendacion(
            metodo_principal_perfil, metodo_secundario_perfil, dificultad, tema
        )
        
        # Guardar recomendación en el historial
        recomendacion_guardada = RecomendacionMetodoEstudio.objects.create(
            usuario=request.user,
            tema=tema,
            metodo_principal=recomendacion['metodo_principal'],
            metodo_complementario=recomendacion.get('metodo_complementario'),
            descripcion=recomendacion['descripcion'],
            razon=recomendacion['razon']
        )
        
        serializer = RecomendacionMetodoEstudioSerializer(recomendacion_guardada)
        return Response({
            "mensaje": "Recomendación generada con éxito",
            "recomendacion": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def _generar_recomendacion(self, metodo_principal, metodo_secundario, dificultad, tema):
        """Genera la recomendación combinando perfil de aprendizaje, tipo de tema y dificultad"""
        
        # Buscar prioridades específicas para este tema
        tema_nombre_lower = tema.nombre.lower()
        prioridades_tema = None
        
        # Buscar coincidencias en la tabla de prioridades
        for palabra_clave, prioridades in PRIORIDADES_METODO_POR_TEMA.items():
            if palabra_clave in tema_nombre_lower:
                prioridades_tema = prioridades
                break
        
        # Determinar método principal recomendado
        if prioridades_tema:
            # Ordenar métodos por prioridad (menor número = mayor prioridad)
            metodos_ordenados = sorted(prioridades_tema.items(), key=lambda x: x[1])
            metodo_recomendado = metodos_ordenados[0][0]  # El de mayor prioridad
            
            # Ajustar según perfil del usuario si es compatible
            if metodo_principal in prioridades_tema and prioridades_tema[metodo_principal] <= 2:
                # Si el método principal del perfil tiene prioridad 1 o 2, usarlo
                metodo_recomendado = metodo_principal
            
            # Método complementario: el segundo mejor según prioridades
            metodo_complementario = None
            if len(metodos_ordenados) > 1 and metodos_ordenados[1][1] <= 2:
                metodo_complementario = metodos_ordenados[1][0]
                # No repetir el método principal
                if metodo_complementario == metodo_recomendado:
                    metodo_complementario = metodos_ordenados[2][0] if len(metodos_ordenados) > 2 else None
        else:
            # Si no hay prioridades específicas, usar perfil del usuario
            metodo_recomendado = metodo_principal
            metodo_complementario = None
            
            # Lógica de combinación según dificultad y perfil
            if dificultad == 'alta':
                # Para temas difíciles, combinar con Feynman para comprensión
                if metodo_principal != 'Feynman' and metodo_secundario == 'Feynman':
                    metodo_complementario = 'Feynman'
            elif dificultad == 'baja':
                # Para temas fáciles, puede combinar con Leitner para consolidación
                if metodo_principal == 'Pomodoro' and metodo_secundario == 'Leitner':
                    metodo_complementario = 'Leitner'
            
            # Si hay método secundario significativo, considerarlo como complementario
            if not metodo_complementario and metodo_secundario and metodo_secundario != metodo_recomendado:
                metodo_complementario = metodo_secundario
        
        # Construir descripción (genérica del método)
        descripcion = self.DESCRIPCIONES_METODOS[metodo_recomendado]['descripcion']
        if metodo_complementario:
            descripcion += f"\n\nSe recomienda combinarlo con la técnica {metodo_complementario} para un aprendizaje más completo."
        
        # Construir explicación específica de aplicación al tema y curso
        razon = self._generar_explicacion_aplicacion(
            metodo_recomendado, metodo_complementario, metodo_principal, 
            dificultad, tema, prioridades_tema
        )
        
        return {
            'metodo_principal': metodo_recomendado,
            'metodo_complementario': metodo_complementario,
            'descripcion': descripcion,
            'razon': razon
        }
    
    def _generar_explicacion_aplicacion(self, metodo_recomendado, metodo_complementario, 
                                       metodo_principal, dificultad, tema, prioridades_tema=None):
        """Genera una explicación específica de cómo aplicar el método al tema/curso"""
        
        curso_nombre = tema.curso.nombre
        tema_nombre = tema.nombre
        
        explicacion = f"<strong>Técnica Recomendada: {metodo_recomendado}"
        if metodo_complementario:
            explicacion += f" + {metodo_complementario}"
        explicacion += f"</strong><br><br>"
        
        # Explicar por qué se eligió este método si hay prioridades
        if prioridades_tema:
            explicacion += f"<strong>¿Por qué esta técnica?</strong><br>"
            explicacion += f"Basado en el análisis del tema '{tema_nombre}', la técnica {metodo_recomendado} "
            explicacion += f"es la más efectiva para este tipo de contenido. "
        else:
            explicacion += f"<strong>Basado en tu perfil:</strong> Esta recomendación se adaptó a tu estilo de aprendizaje preferido ({metodo_principal}). "
        
        explicacion += f"<br><br><strong>Cómo aplicarlo a '{tema_nombre}':</strong><br><br>"
        
        # Explicaciones específicas por método y dificultad
        if metodo_recomendado == 'Pomodoro':
            if dificultad == 'alta':
                # Cálculo: 150 min * 1.5 (peso alta) = 225 min total → 225/30 = 7.5 → 8 sesiones
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['alta']  # 225 min
                num_sesiones = int(tiempo_total / 30) + (1 if tiempo_total % 30 > 0 else 0)  # 8 sesiones
                explicacion += f"• <strong>Total recomendado:</strong> {num_sesiones} sesiones de 25 minutos (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"• <strong>Sesión 1 (25 min):</strong> Lee y subraya los conceptos principales de '{tema_nombre}'.<br>"
                explicacion += f"• <strong>Descanso (5 min):</strong> Revisa lo subrayado mentalmente.<br>"
                explicacion += f"• <strong>Sesión 2 (25 min):</strong> Resuelve ejercicios básicos aplicando los conceptos.<br>"
                explicacion += f"• <strong>Descanso (5 min):</strong> Repasa los errores cometidos.<br>"
                explicacion += f"• <strong>Sesión 3 (25 min):</strong> Trabaja en ejercicios más complejos.<br>"
                explicacion += f"• <strong>Descanso (5 min):</strong> Verifica soluciones con el material de referencia.<br>"
                explicacion += f"• <strong>Sesión 4 (25 min):</strong> Crea un resumen con fórmulas y pasos clave.<br>"
                explicacion += f"• <strong>Descanso largo (15 min):</strong> Relajación total - muévete, toma agua.<br>"
            elif dificultad == 'media':
                # Cálculo: 150 min * 1.0 (peso media) = 150 min total → 150/30 = 5 sesiones
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['media']  # 150 min
                num_sesiones = int(tiempo_total / 30)  # 5 sesiones
                explicacion += f"• <strong>Total recomendado:</strong> {num_sesiones} sesiones de 25 minutos (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"• <strong>Sesión 1-2 (25 min c/u):</strong> Estudia la teoría y toma apuntes.<br>"
                explicacion += f"• <strong>Sesión 3-4 (25 min c/u):</strong> Practica con ejercicios y ejemplos.<br>"
                explicacion += f"• <strong>Descansos:</strong> 5 min entre sesiones, 15 min al final del ciclo.<br>"
            else:  # baja
                # Cálculo: 150 min * 0.5 (peso baja) = 75 min total → 75/30 = 2.5 → 3 sesiones
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['baja']  # 75 min
                num_sesiones = int(tiempo_total / 30) + (1 if tiempo_total % 30 > 0 else 0)  # 3 sesiones
                explicacion += f"• <strong>Total recomendado:</strong> {num_sesiones} sesiones de 25 minutos (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"• <strong>Sesiones cortas (25 min c/u):</strong> Revisa y consolida conocimientos.<br>"
                explicacion += f"• <strong>Usa descansos (5 min):</strong> Para repasar mentalmente lo aprendido.<br>"
                explicacion += f"• <strong>Mantén el hábito:</strong> Aunque sea fácil, la disciplina te preparará para temas complejos.<br>"
                
        elif metodo_recomendado == 'Feynman':
            if dificultad == 'alta':
                # Cálculo: 225 min / sesiones de 40 min = 5-6 ciclos
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['alta']  # 225 min
                num_ciclos = int(tiempo_total / 40) + (1 if tiempo_total % 40 > 0 else 0)  # 6 ciclos
                explicacion += f"• <strong>Total recomendado:</strong> {num_ciclos} ciclos de estudio-explicación (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"1. <strong>Estudia el concepto complejo (30 min):</strong> Lee '{tema_nombre}' del curso '{curso_nombre}' detenidamente.<br>"
                explicacion += f"2. <strong>Explícalo en voz alta (durante estudio):</strong> Imagina que le enseñas a alguien sin conocimientos previos.<br>"
                explicacion += f"3. <strong>Identifica lagunas:</strong> Si te trabas al explicar, ¡ahí está tu área débil!<br>"
                explicacion += f"4. <strong>Refuerza y simplifica:</strong> Vuelve al material, entiéndelo mejor, y explícalo con analogías.<br>"
                explicacion += f"5. <strong>Descanso (10 min):</strong> Reflexiona sobre lo aprendido.<br>"
            elif dificultad == 'media':
                # Cálculo: 150 min / sesiones de 30 min = 5 ciclos
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['media']  # 150 min
                num_ciclos = int(tiempo_total / 30)  # 5 ciclos
                explicacion += f"• <strong>Total recomendado:</strong> {num_ciclos} ciclos de explicación (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"• <strong>Explica cada concepto clave</strong> de '{tema_nombre}' con tus propias palabras.<br>"
                explicacion += f"• <strong>Graba tu explicación</strong> (audio/video) y luego escúchala para detectar errores.<br>"
                explicacion += f"• <strong>Crea analogías:</strong> Relaciona conceptos difíciles con situaciones cotidianas.<br>"
            else:  # baja
                # Cálculo: 75 min / sesiones de 20 min = 3-4 ciclos
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['baja']  # 75 min
                num_ciclos = int(tiempo_total / 20) + (1 if tiempo_total % 20 > 0 else 0)  # 4 ciclos
                explicacion += f"• <strong>Total recomendado:</strong> {num_ciclos} sesiones de enseñanza (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"• <strong>Enseña lo que sabes:</strong> Explícale '{tema_nombre}' a un amigo o familiar.<br>"
                explicacion += f"• <strong>Consolida tu dominio:</strong> Aunque sea fácil, enseñar refuerza la memoria a largo plazo.<br>"
                
        elif metodo_recomendado == 'Leitner':
            if dificultad == 'alta':
                # Cálculo: 225 min / sesiones de 20 min = 11 sesiones de repaso
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['alta']  # 225 min
                num_sesiones = int(tiempo_total / 20) + (1 if tiempo_total % 20 > 0 else 0)  # 12 sesiones
                explicacion += f"• <strong>Total recomendado:</strong> {num_sesiones} sesiones de repaso con flashcards (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"• <strong>Crea flashcards (tarjetas):</strong> Una por cada fórmula, definición o concepto difícil de '{tema_nombre}'.<br>"
                explicacion += f"• <strong>Organiza en 5 cajas:</strong> Caja 1 (diario), Caja 2 (cada 2 días), Caja 3 (semanal), etc.<br>"
                explicacion += f"• <strong>Revisión activa:</strong> Si respondes bien, la tarjeta avanza a la siguiente caja. Si fallas, vuelve a Caja 1.<br>"
                explicacion += f"• <strong>Enfoque en lo difícil:</strong> Las tarjetas en Caja 1 se revisan más frecuentemente.<br>"
            elif dificultad == 'media':
                # Cálculo: 150 min / sesiones de 15 min = 10 sesiones
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['media']  # 150 min
                num_sesiones = int(tiempo_total / 15)  # 10 sesiones
                explicacion += f"• <strong>Total recomendado:</strong> {num_sesiones} sesiones de repaso espaciado (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"• <strong>Flashcards para conceptos clave:</strong> Definiciones, fórmulas, procedimientos de '{tema_nombre}'.<br>"
                explicacion += f"• <strong>Sistema de repetición espaciada:</strong> Revisa las difíciles más seguido.<br>"
            else:  # baja
                # Cálculo: 75 min / sesiones de 10 min = 7-8 repasos rápidos
                tiempo_total = TIEMPO_BASE_MINUTOS * PESOS_DIFICULTAD['baja']  # 75 min
                num_sesiones = int(tiempo_total / 10) + (1 if tiempo_total % 10 > 0 else 0)  # 8 sesiones
                explicacion += f"• <strong>Total recomendado:</strong> {num_sesiones} repasos rápidos con tarjetas (aprox {int(tiempo_total)} min totales).<br>"
                explicacion += f"• <strong>Tarjetas simples:</strong> Crea flashcards para no olvidar detalles de '{tema_nombre}'.<br>"
                explicacion += f"• <strong>Repaso periódico:</strong> Aunque sea fácil, el repaso espaciado evita el olvido.<br>"
        
        # Agregar información sobre método complementario
        if metodo_complementario:
            explicacion += f"<br><br><strong>Combinación con {metodo_complementario}:</strong><br>"
            if metodo_complementario == 'Feynman' and metodo_recomendado == 'Pomodoro':
                explicacion += f"• Usa los <strong>descansos de 5 minutos</strong> para explicarte en voz alta lo que acabas de estudiar.<br>"
                explicacion += f"• Después de cada bloque de 25 minutos de Pomodoro, dedica el descanso a enseñar el concepto.<br>"
            elif metodo_complementario == 'Leitner' and metodo_recomendado == 'Pomodoro':
                explicacion += f"• Durante los <strong>descansos</strong>, revisa 2-3 flashcards de '{tema_nombre}'.<br>"
                explicacion += f"• Aprovecha los 5 minutos para repaso activo sin saturarte.<br>"
            elif metodo_complementario == 'Pomodoro':
                explicacion += f"• Estructura tus sesiones de {metodo_recomendado} usando <strong>bloques de 25 minutos</strong> para mantener concentración.<br>"
        
        # Nota final sobre perfil
        explicacion += f"<br><br><strong>Personalización:</strong> Esta recomendación considera tu perfil de aprendizaje ({metodo_principal})"
        if prioridades_tema:
            explicacion += f" y las características específicas del tema '{tema_nombre}'"
        explicacion += f", optimizando tu estudio con dificultad <strong>{dificultad}</strong>.<br>"
        
        return explicacion
    
    def get(self, request):
        """Obtener historial de recomendaciones del usuario"""
        tema_id = request.query_params.get('tema_id')
        
        recomendaciones = RecomendacionMetodoEstudio.objects.filter(usuario=request.user)
        
        if tema_id:
            recomendaciones = recomendaciones.filter(tema_id=tema_id)
        
        recomendaciones = recomendaciones.order_by('-fecha_recomendacion')[:10]  # Últimas 10
        
        serializer = RecomendacionMetodoEstudioSerializer(recomendaciones, many=True)
        return Response(serializer.data)


class TemaDificultadView(APIView):
    """Vista para asignar dificultad a un tema"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Obtener temas con dificultad asignada por el usuario"""
        temas_dificultad = TemaDificultad.objects.filter(usuario=request.user)
        serializer = TemaDificultadSerializer(temas_dificultad, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Asignar dificultad a un tema"""
        tema_id = request.data.get('tema_id')
        dificultad = request.data.get('dificultad')
        
        if not all([tema_id, dificultad]):
            return Response(
                {"error": "Se requieren tema_id y dificultad"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el tema existe
        try:
            tema = Tema.objects.get(id=tema_id)
        except Tema.DoesNotExist:
            return Response({"error": "Tema no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # Crear o actualizar tema con dificultad
        tema_dificultad, created = TemaDificultad.objects.update_or_create(
            usuario=request.user,
            tema=tema,
            defaults={'dificultad': dificultad}
        )
        
        serializer = TemaDificultadSerializer(tema_dificultad)
        return Response(
            {
                "mensaje": "Dificultad asignada con éxito" if created else "Dificultad actualizada con éxito",
                "tema_dificultad": serializer.data
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    def delete(self, request):
        """Eliminar asignación de dificultad de un tema"""
        tema_dificultad_id = request.query_params.get('id')
        
        if not tema_dificultad_id:
            return Response(
                {"error": "Se requiere el id del tema con dificultad"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el tema con dificultad existe y pertenece al usuario
        try:
            tema_dificultad = TemaDificultad.objects.get(id=tema_dificultad_id, usuario=request.user)
        except TemaDificultad.DoesNotExist:
            return Response(
                {"error": "Tema con dificultad no encontrado o no pertenece al usuario"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Eliminar el tema con dificultad
        tema_dificultad.delete()
        
        return Response(
            {"mensaje": "Asignación de dificultad eliminada con éxito"},
            status=status.HTTP_200_OK
        )


class GenerarPlanificacionView(APIView):
    """Vista para generar planificación adaptativa ponderada"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generar planificación basada en tema con dificultad"""
        tema_dificultad_id = request.data.get('tema_dificultad_id')
        fecha_inicio_str = request.data.get('fecha_inicio')
        hora_preferida_str = request.data.get('hora_preferida', '09:00')  # Hora por defecto
        dias_disponibles = request.data.get('dias_disponibles', ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'])
        
        if not all([tema_dificultad_id, fecha_inicio_str]):
            return Response(
                {"error": "Se requieren tema_dificultad_id y fecha_inicio"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el tema con dificultad existe y pertenece al usuario
        try:
            tema_dificultad = TemaDificultad.objects.get(id=tema_dificultad_id, usuario=request.user)
        except TemaDificultad.DoesNotExist:
            return Response(
                {"error": "Tema con dificultad no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Convertir fecha de inicio
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Formato de fecha inválido. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generar planificación
        resultado = self._generar_planificacion(
            tema_dificultad, fecha_inicio, hora_preferida_str, dias_disponibles
        )
        
        return Response(resultado, status=status.HTTP_201_CREATED)
    
    def _generar_planificacion(self, tema_dificultad, fecha_inicio, hora_preferida_str, dias_disponibles):
        """Genera las sesiones de estudio según la dificultad y distribuidas en los días disponibles"""
        
        # Obtener perfil del usuario para determinar método recomendado
        try:
            perfil = PerfilAprendizaje.objects.get(usuario=tema_dificultad.usuario)
            metodo = perfil.metodo_principal
        except PerfilAprendizaje.DoesNotExist:
            metodo = 'Pomodoro'  # Por defecto
        
        if metodo not in METODOS_CONFIG:
            metodo = 'Pomodoro'
        
        config = METODOS_CONFIG[metodo]
        
        # Calcular tiempo total basado en peso de dificultad
        # Ejemplo: dificultad media (peso 1.0) = 150 min
        peso = PESOS_DIFICULTAD[tema_dificultad.dificultad]
        tiempo_total_minutos = int(TIEMPO_BASE_MINUTOS * peso)
        
        # Calcular cuántos días hay disponibles
        num_dias_disponibles = len(dias_disponibles)
        if num_dias_disponibles == 0:
            num_dias_disponibles = 5  # Por defecto 5 días
        
        # Distribuir tiempo entre los días: tiempo_por_dia = tiempo_total / num_dias
        tiempo_por_dia = tiempo_total_minutos / num_dias_disponibles
        
        # Calcular cuántas sesiones de estudio caben en ese tiempo por día
        # Cada sesión incluye tiempo de estudio + descanso
        if metodo == 'Pomodoro':
            # Pomodoro: 25 min estudio + 5 min descanso = 30 min por sesión
            tiempo_por_sesion = config['duracion_estudio'] + config['duracion_descanso_corto']
        elif metodo == 'Feynman':
            # Feynman: 30 min estudio + 10 min descanso = 40 min por sesión
            tiempo_por_sesion = config['duracion_estudio'] + config['duracion_descanso']
        elif metodo == 'Leitner':
            # Leitner: 20 min estudio + 5 min descanso = 25 min por sesión
            tiempo_por_sesion = config['duracion_estudio'] + config['duracion_descanso']
        else:
            tiempo_por_sesion = 30  # Por defecto
        
        sesiones_por_dia = max(1, int(tiempo_por_dia / tiempo_por_sesion))
        
        # Mapeo de días de la semana
        dias_map = {
            'lunes': 0, 'martes': 1, 'miercoles': 2, 'jueves': 3,
            'viernes': 4, 'sabado': 5, 'domingo': 6
        }
        dias_validos = [dias_map[d] for d in dias_disponibles if d in dias_map]
        
        # Crear la planificación
        sesiones_creadas = []
        fecha_actual = fecha_inicio
        numero_sesion = 1
        dias_generados = 0
        
        # Convertir hora preferida
        try:
            hora_inicio = datetime.strptime(hora_preferida_str, '%H:%M').time()
        except ValueError:
            hora_inicio = time(9, 0)  # 9:00 AM por defecto
        
        # Generar sesiones distribuyendo en los días disponibles
        while dias_generados < num_dias_disponibles:
            # Verificar si el día actual está en los días disponibles
            if fecha_actual.weekday() in dias_validos:
                hora_actual = datetime.combine(fecha_actual, hora_inicio)
                
                # Generar las sesiones para este día
                for _ in range(sesiones_por_dia):
                    if metodo == 'Pomodoro':
                        sesion_estudio = SesionEstudio.objects.create(
                            usuario=tema_dificultad.usuario,
                            tema_dificultad=tema_dificultad,
                            tipo_sesion='estudio',
                            fecha=fecha_actual,
                            hora_inicio=hora_actual.time(),
                            hora_fin=(hora_actual + timedelta(minutes=config['duracion_estudio'])).time(),
                            duracion_minutos=config['duracion_estudio'],
                            numero_sesion=numero_sesion
                        )
                        sesiones_creadas.append(sesion_estudio)
                        hora_actual += timedelta(minutes=config['duracion_estudio'])
                        
                        # Descanso
                        sesion_descanso = SesionEstudio.objects.create(
                            usuario=tema_dificultad.usuario,
                            tema_dificultad=tema_dificultad,
                            tipo_sesion='descanso',
                            fecha=fecha_actual,
                            hora_inicio=hora_actual.time(),
                            hora_fin=(hora_actual + timedelta(minutes=config['duracion_descanso_corto'])).time(),
                            duracion_minutos=config['duracion_descanso_corto'],
                            numero_sesion=numero_sesion
                        )
                        sesiones_creadas.append(sesion_descanso)
                        hora_actual += timedelta(minutes=config['duracion_descanso_corto'])
                        
                    elif metodo == 'Feynman':
                        sesion_estudio = SesionEstudio.objects.create(
                            usuario=tema_dificultad.usuario,
                            tema_dificultad=tema_dificultad,
                            tipo_sesion='estudio',
                            fecha=fecha_actual,
                            hora_inicio=hora_actual.time(),
                            hora_fin=(hora_actual + timedelta(minutes=config['duracion_estudio'])).time(),
                            duracion_minutos=config['duracion_estudio'],
                            numero_sesion=numero_sesion
                        )
                        sesiones_creadas.append(sesion_estudio)
                        hora_actual += timedelta(minutes=config['duracion_estudio'])
                        
                        # Descanso
                        sesion_descanso = SesionEstudio.objects.create(
                            usuario=tema_dificultad.usuario,
                            tema_dificultad=tema_dificultad,
                            tipo_sesion='descanso',
                            fecha=fecha_actual,
                            hora_inicio=hora_actual.time(),
                            hora_fin=(hora_actual + timedelta(minutes=config['duracion_descanso'])).time(),
                            duracion_minutos=config['duracion_descanso'],
                            numero_sesion=numero_sesion
                        )
                        sesiones_creadas.append(sesion_descanso)
                        hora_actual += timedelta(minutes=config['duracion_descanso'])
                        
                    elif metodo == 'Leitner':
                        sesion_estudio = SesionEstudio.objects.create(
                            usuario=tema_dificultad.usuario,
                            tema_dificultad=tema_dificultad,
                            tipo_sesion='estudio',
                            fecha=fecha_actual,
                            hora_inicio=hora_actual.time(),
                            hora_fin=(hora_actual + timedelta(minutes=config['duracion_estudio'])).time(),
                            duracion_minutos=config['duracion_estudio'],
                            numero_sesion=numero_sesion
                        )
                        sesiones_creadas.append(sesion_estudio)
                        hora_actual += timedelta(minutes=config['duracion_estudio'])
                        
                        # Descanso
                        sesion_descanso = SesionEstudio.objects.create(
                            usuario=tema_dificultad.usuario,
                            tema_dificultad=tema_dificultad,
                            tipo_sesion='descanso',
                            fecha=fecha_actual,
                            hora_inicio=hora_actual.time(),
                            hora_fin=(hora_actual + timedelta(minutes=config['duracion_descanso'])).time(),
                            duracion_minutos=config['duracion_descanso'],
                            numero_sesion=numero_sesion
                        )
                        sesiones_creadas.append(sesion_descanso)
                        hora_actual += timedelta(minutes=config['duracion_descanso'])
                    
                    numero_sesion += 1
                
                dias_generados += 1
            
            # Avanzar al siguiente día
            fecha_actual += timedelta(days=1)
            
            # Limitar a 60 días para evitar bucles infinitos
            if (fecha_actual - fecha_inicio).days > 60:
                break
        
        # Calcular fecha de fin
        fecha_fin = max(s.fecha for s in sesiones_creadas) if sesiones_creadas else fecha_inicio
        
        # Crear el registro de planificación
        planificacion = PlanificacionAdaptativa.objects.create(
            usuario=tema_dificultad.usuario,
            tema_dificultad=tema_dificultad,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            total_sesiones=len([s for s in sesiones_creadas if s.tipo_sesion == 'estudio'])
        )
        
        # Serializar respuesta
        serializer = PlanificacionAdaptativaSerializer(planificacion)
        
        return {
            "mensaje": f"Planificación generada: {tiempo_total_minutos} min totales, {int(tiempo_por_dia)} min/día, {sesiones_por_dia} sesión(es) por día",
            "planificacion": serializer.data,
            "sesiones_generadas": len(sesiones_creadas),
            "detalles": {
                "tiempo_total_minutos": tiempo_total_minutos,
                "peso_dificultad": peso,
                "dias_disponibles": num_dias_disponibles,
                "tiempo_por_dia": int(tiempo_por_dia),
                "sesiones_por_dia": sesiones_por_dia
            }
        }


class PlanificacionesView(APIView):
    """Vista para listar planificaciones del usuario"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Obtener todas las planificaciones del usuario"""
        planificaciones = PlanificacionAdaptativa.objects.filter(
            usuario=request.user
        ).order_by('-fecha_creacion')
        
        serializer = PlanificacionAdaptativaSerializer(planificaciones, many=True)
        return Response(serializer.data)


class SesionesEstudioView(APIView):
    """Vista para gestionar sesiones de estudio"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Obtener sesiones de estudio del usuario"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        sesiones = SesionEstudio.objects.filter(usuario=request.user)
        
        # Filtrar por rango de fechas si se proporciona
        if fecha_inicio:
            sesiones = sesiones.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            sesiones = sesiones.filter(fecha__lte=fecha_fin)
        
        serializer = SesionEstudioSerializer(sesiones, many=True)
        return Response(serializer.data)
    
    def patch(self, request, pk=None):
        """Editar manualmente una sesión de estudio"""
        if not pk:
            return Response(
                {"error": "Se requiere el ID de la sesión"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sesion = SesionEstudio.objects.get(id=pk, usuario=request.user)
        except SesionEstudio.DoesNotExist:
            return Response(
                {"error": "Sesión no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Actualizar campos permitidos
        campos_editables = ['fecha', 'hora_inicio', 'hora_fin', 'completada']
        for campo in campos_editables:
            if campo in request.data:
                setattr(sesion, campo, request.data[campo])
        
        # Recalcular duración si cambian las horas
        if 'hora_inicio' in request.data or 'hora_fin' in request.data:
            inicio = datetime.combine(sesion.fecha, sesion.hora_inicio)
            fin = datetime.combine(sesion.fecha, sesion.hora_fin)
            sesion.duracion_minutos = int((fin - inicio).total_seconds() / 60)
        
        sesion.save()
        
        serializer = SesionEstudioSerializer(sesion)
        return Response({
            "mensaje": "Sesión actualizada con éxito",
            "sesion": serializer.data
        })
    
    def delete(self, request, pk=None):
        """Eliminar una sesión de estudio"""
        if not pk:
            return Response(
                {"error": "Se requiere el ID de la sesión"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sesion = SesionEstudio.objects.get(id=pk, usuario=request.user)
            sesion.delete()
            return Response(
                {"mensaje": "Sesión eliminada con éxito"},
                status=status.HTTP_200_OK
            )
        except SesionEstudio.DoesNotExist:
            return Response(
                {"error": "Sesión no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

