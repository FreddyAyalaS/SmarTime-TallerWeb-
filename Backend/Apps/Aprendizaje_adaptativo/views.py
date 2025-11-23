from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from .models import (
    PreguntaPerfil, RespuestaPerfil, PerfilAprendizaje,
    Tema, Curso, TemaDificultad, SesionEstudio, PlanificacionAdaptativa
)
from .serializers import (
    PreguntaPerfilSerializer, RespuestaPerfilSerializer, PerfilAprendizajeSerializer,
    TemaSerializer, CursoSerializer, TemaDificultadSerializer,
    SesionEstudioSerializer, PlanificacionAdaptativaSerializer
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

# Multiplicadores de sesiones según dificultad
MULTIPLICADORES_DIFICULTAD = {
    'baja': 0.7,    # Menos sesiones
    'media': 1.0,   # Sesiones normales
    'alta': 1.5,    # Más sesiones
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
        metodo_estudio = request.data.get('metodo_estudio')
        
        if not all([tema_id, dificultad, metodo_estudio]):
            return Response(
                {"error": "Se requieren tema_id, dificultad y metodo_estudio"},
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
            defaults={
                'dificultad': dificultad,
                'metodo_estudio': metodo_estudio
            }
        )
        
        serializer = TemaDificultadSerializer(tema_dificultad)
        return Response(
            {
                "mensaje": "Dificultad asignada con éxito" if created else "Dificultad actualizada con éxito",
                "tema_dificultad": serializer.data
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
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
        """Genera las sesiones de estudio según la dificultad y el método"""
        
        # Obtener configuración del método
        metodo = tema_dificultad.metodo_estudio
        if metodo not in METODOS_CONFIG:
            metodo = 'Pomodoro'  # Por defecto
        
        config = METODOS_CONFIG[metodo]
        multiplicador = MULTIPLICADORES_DIFICULTAD[tema_dificultad.dificultad]
        
        # Calcular número total de sesiones
        total_sesiones = math.ceil(SESIONES_BASE * multiplicador)
        
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
        
        # Convertir hora preferida
        try:
            hora_inicio = datetime.strptime(hora_preferida_str, '%H:%M').time()
        except ValueError:
            hora_inicio = time(9, 0)  # 9:00 AM por defecto
        
        while numero_sesion <= total_sesiones:
            # Verificar si el día actual está en los días disponibles
            if fecha_actual.weekday() in dias_validos:
                hora_actual = datetime.combine(fecha_actual, hora_inicio)
                
                # Generar sesiones según el método
                if metodo == 'Pomodoro':
                    sesiones_dia = self._generar_sesiones_pomodoro(
                        tema_dificultad, fecha_actual, hora_actual, numero_sesion, config
                    )
                elif metodo == 'Feynman':
                    sesiones_dia = self._generar_sesiones_feynman(
                        tema_dificultad, fecha_actual, hora_actual, numero_sesion, config
                    )
                elif metodo == 'Leitner':
                    sesiones_dia = self._generar_sesiones_leitner(
                        tema_dificultad, fecha_actual, hora_actual, numero_sesion, config
                    )
                else:
                    sesiones_dia = self._generar_sesiones_pomodoro(
                        tema_dificultad, fecha_actual, hora_actual, numero_sesion, config
                    )
                
                sesiones_creadas.extend(sesiones_dia)
                numero_sesion += len([s for s in sesiones_dia if s.tipo_sesion == 'estudio'])
            
            # Avanzar al siguiente día
            fecha_actual += timedelta(days=1)
            
            # Limitar a 30 días para evitar bucles infinitos
            if (fecha_actual - fecha_inicio).days > 30:
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
            "mensaje": "Planificación generada con éxito",
            "planificacion": serializer.data,
            "sesiones_generadas": len(sesiones_creadas)
        }
    
    def _generar_sesiones_pomodoro(self, tema_dificultad, fecha, hora_inicio, numero_sesion, config):
        """Genera sesiones siguiendo la técnica Pomodoro"""
        sesiones = []
        hora_actual = hora_inicio
        
        # Generar un ciclo Pomodoro (4 sesiones de estudio con descansos)
        for i in range(config['sesiones_por_ciclo']):
            # Sesión de estudio
            hora_fin = hora_actual + timedelta(minutes=config['duracion_estudio'])
            sesion_estudio = SesionEstudio.objects.create(
                usuario=tema_dificultad.usuario,
                tema_dificultad=tema_dificultad,
                tipo_sesion='estudio',
                fecha=fecha,
                hora_inicio=hora_actual.time(),
                hora_fin=hora_fin.time(),
                duracion_minutos=config['duracion_estudio'],
                numero_sesion=numero_sesion + i
            )
            sesiones.append(sesion_estudio)
            hora_actual = hora_fin
            
            # Descanso (corto o largo)
            if i < config['sesiones_por_ciclo'] - 1:
                # Descanso corto
                hora_fin = hora_actual + timedelta(minutes=config['duracion_descanso_corto'])
                sesion_descanso = SesionEstudio.objects.create(
                    usuario=tema_dificultad.usuario,
                    tema_dificultad=tema_dificultad,
                    tipo_sesion='descanso',
                    fecha=fecha,
                    hora_inicio=hora_actual.time(),
                    hora_fin=hora_fin.time(),
                    duracion_minutos=config['duracion_descanso_corto'],
                    numero_sesion=numero_sesion + i
                )
                sesiones.append(sesion_descanso)
                hora_actual = hora_fin
            else:
                # Descanso largo al final del ciclo
                hora_fin = hora_actual + timedelta(minutes=config['duracion_descanso_largo'])
                sesion_descanso = SesionEstudio.objects.create(
                    usuario=tema_dificultad.usuario,
                    tema_dificultad=tema_dificultad,
                    tipo_sesion='descanso',
                    fecha=fecha,
                    hora_inicio=hora_actual.time(),
                    hora_fin=hora_fin.time(),
                    duracion_minutos=config['duracion_descanso_largo'],
                    numero_sesion=numero_sesion + i
                )
                sesiones.append(sesion_descanso)
        
        return sesiones
    
    def _generar_sesiones_feynman(self, tema_dificultad, fecha, hora_inicio, numero_sesion, config):
        """Genera sesiones siguiendo la técnica Feynman"""
        sesiones = []
        hora_actual = hora_inicio
        
        for i in range(config['sesiones_por_ciclo']):
            # Sesión de estudio
            hora_fin = hora_actual + timedelta(minutes=config['duracion_estudio'])
            sesion_estudio = SesionEstudio.objects.create(
                usuario=tema_dificultad.usuario,
                tema_dificultad=tema_dificultad,
                tipo_sesion='estudio',
                fecha=fecha,
                hora_inicio=hora_actual.time(),
                hora_fin=hora_fin.time(),
                duracion_minutos=config['duracion_estudio'],
                numero_sesion=numero_sesion + i
            )
            sesiones.append(sesion_estudio)
            hora_actual = hora_fin
            
            # Descanso
            hora_fin = hora_actual + timedelta(minutes=config['duracion_descanso'])
            sesion_descanso = SesionEstudio.objects.create(
                usuario=tema_dificultad.usuario,
                tema_dificultad=tema_dificultad,
                tipo_sesion='descanso',
                fecha=fecha,
                hora_inicio=hora_actual.time(),
                hora_fin=hora_fin.time(),
                duracion_minutos=config['duracion_descanso'],
                numero_sesion=numero_sesion + i
            )
            sesiones.append(sesion_descanso)
            hora_actual = hora_fin
        
        return sesiones
    
    def _generar_sesiones_leitner(self, tema_dificultad, fecha, hora_inicio, numero_sesion, config):
        """Genera sesiones siguiendo la técnica Leitner"""
        sesiones = []
        hora_actual = hora_inicio
        
        for i in range(config['sesiones_por_ciclo']):
            tipo = 'repaso' if i % 2 == 0 else 'estudio'
            
            # Sesión de estudio o repaso
            hora_fin = hora_actual + timedelta(minutes=config['duracion_estudio'])
            sesion = SesionEstudio.objects.create(
                usuario=tema_dificultad.usuario,
                tema_dificultad=tema_dificultad,
                tipo_sesion=tipo,
                fecha=fecha,
                hora_inicio=hora_actual.time(),
                hora_fin=hora_fin.time(),
                duracion_minutos=config['duracion_estudio'],
                numero_sesion=numero_sesion + i
            )
            sesiones.append(sesion)
            hora_actual = hora_fin
            
            # Descanso
            hora_fin = hora_actual + timedelta(minutes=config['duracion_descanso'])
            sesion_descanso = SesionEstudio.objects.create(
                usuario=tema_dificultad.usuario,
                tema_dificultad=tema_dificultad,
                tipo_sesion='descanso',
                fecha=fecha,
                hora_inicio=hora_actual.time(),
                hora_fin=hora_fin.time(),
                duracion_minutos=config['duracion_descanso'],
                numero_sesion=numero_sesion + i
            )
            sesiones.append(sesion_descanso)
            hora_actual = hora_fin
        
        return sesiones


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

