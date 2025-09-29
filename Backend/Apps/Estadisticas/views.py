from datetime import timedelta
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from Apps.Calendario.models import Tarea
from Apps.Tareas.models import EstadoTarea


class EstadoTareasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hoy = now().date()
        inicio_semana = hoy - timedelta(days=hoy.weekday())  # lunes
        fin_semana = inicio_semana + timedelta(days=6)  # domingo

        tareas = Tarea.objects.filter(usuario=request.user)

        contador = {
            "por_hacer": 0,
            "en_proceso_dentro_fecha": 0,
            "en_proceso_fuera_fecha": 0,
            "finalizado_dentro_fecha": 0,
            "finalizado_fuera_fecha": 0,
        }

        for tarea in tareas:
            estado = (
                EstadoTarea.objects.filter(tarea=tarea)
                .order_by("-fecha_estado")
                .first()
            )

            # Línea de depuración:
            print(
                tarea.titulo,
                tarea.fechaEntrega,
                estado.estado if estado else "Sin estado",
            )

            # Obtenemos la fecha de entrega
            fecha_entrega = tarea.fechaEntrega

            if not estado:
                if inicio_semana <= fecha_entrega <= fin_semana:
                    contador["por_hacer"] += 1
                elif fecha_entrega < hoy:
                    contador["en_proceso_fuera_fecha"] += 1  # nunca se hizo y ya pasó
                # si es futuro y no está en la semana actual, lo ignoramos
            elif estado.estado in ["inicio", "en_desarrollo"]:
                if fecha_entrega < hoy:
                    contador["en_proceso_fuera_fecha"] += 1
                else:
                    contador["en_proceso_dentro_fecha"] += 1

            elif estado.estado in ["finalizado", "entregado"]:
                if inicio_semana <= fecha_entrega <= fin_semana:
                    if estado.fecha_estado.date() <= fecha_entrega:
                        contador["finalizado_dentro_fecha"] += 1
                    else:
                        contador["finalizado_fuera_fecha"] += 1
                elif fecha_entrega < hoy:
                    if estado.fecha_estado.date() <= fecha_entrega:
                        contador["finalizado_dentro_fecha"] += 1
                    else:
                        contador["finalizado_fuera_fecha"] += 1
                # si es futuro y no está en la semana actual, lo ignoramos

        total = sum(contador.values()) or 1  # Evitar división por cero

        resultado = {
            clave: f"{(valor / total) * 100:.1f}%" for clave, valor in contador.items()
        }

        return Response(resultado)
