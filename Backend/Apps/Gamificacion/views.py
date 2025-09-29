from datetime import datetime, timedelta
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from Apps.Calendario.models import Tarea
from Apps.Tareas.models import EstadoTarea
from .models import PuntuacionUsuario

from .models import PuntuacionUsuario



class CalcularPuntuacionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        usuario = request.user
        fecha_inicio = request.data.get("fecha_inicio")
        fecha_fin = request.data.get("fecha_fin")

        # Validación de fechas
        if not fecha_inicio or not fecha_fin:
            return Response({'error': 'Debes proporcionar fecha_inicio y fecha_fin'}, status=400)

        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}, status=400)

        tareas = Tarea.objects.filter(
            usuario=usuario,
            visible=True,
            fechaEntrega__range=(fecha_inicio, fecha_fin)
        )

        total_tareas = tareas.count()
        completadas = 0
        estrellas = 0

        # Contar estrellas por tareas individuales
        for tarea in tareas:
            estado = EstadoTarea.objects.filter(tarea=tarea).order_by('-fecha_estado').first()
            if estado and estado.estado in ['finalizado', 'entregado']:
                completadas += 1
                if estado.fecha_estado.date() <= tarea.fechaEntrega:
                    estrellas += 3  # Dentro del plazo
                else:
                    estrellas += 1  # Fuera del plazo

        # Calcular semanas completas en el intervalo
        fecha_lunes = fecha_inicio + timedelta(days=(7 - fecha_inicio.weekday()) % 7)  # primer lunes ≥ fecha_inicio
        fecha_domingo = fecha_fin - timedelta(days=(fecha_fin.weekday() + 1) % 7)      # último domingo ≤ fecha_fin

        semana = fecha_lunes
        semanas_completas = 0

        while semana <= fecha_domingo:
            inicio_semana = semana
            fin_semana = semana + timedelta(days=6)

            tareas_semana = Tarea.objects.filter(
                usuario=usuario,
                visible=True,
                fechaEntrega__range=(inicio_semana, fin_semana)
            )

            if tareas_semana.exists():
                todas_en_fecha = True
                for tarea in tareas_semana:
                    estado = EstadoTarea.objects.filter(tarea=tarea).order_by('-fecha_estado').first()
                    if not estado or estado.estado not in ['finalizado', 'entregado']:
                        todas_en_fecha = False
                        break
                    if estado.fecha_estado.date() > tarea.fechaEntrega:
                        todas_en_fecha = False
                        break

                if todas_en_fecha:
                    estrellas += 2
                    semanas_completas += 1

            semana += timedelta(days=7)

        # Guardar la puntuación
        puntuacion = PuntuacionUsuario.objects.create(
            usuario=usuario,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estrellas=estrellas,
            completado_todas=False  # ya no se usa este criterio
        )

        return Response({
            'mensaje': 'Puntuación registrada con éxito',
            'total_tareas': total_tareas,
            'completadas': completadas,
            'estrellas': estrellas,
            'semanas_con_todo_completo': semanas_completas,
            'intervalo': {
                'inicio': fecha_inicio,
                'fin': fecha_fin
            }
        })


class HistorialEstrellasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        historial = PuntuacionUsuario.objects.filter(usuario=request.user).order_by('fecha_inicio')
        data = [
            {
                "semana_inicio": p.fecha_inicio,
                "semana_fin": p.fecha_fin,
                "estrellas": p.estrellas
            }
            for p in historial
        ]
        return Response(data)