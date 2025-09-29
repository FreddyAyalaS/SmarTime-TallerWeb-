from collections import defaultdict
from django.http import JsonResponse
from Apps.Calendario.models import Tarea, Clase, Estudio
from .utils import (
    enviar_recordatorios_tareas,
    enviar_recordatorios_expiracion,
    enviar_recordatorios_pendientes,
)
from django.utils.timezone import localtime, now, make_aware
from datetime import date, datetime, timedelta


def enviar_recordatorios(request):
    hoy = date.today()

    tarea = Tarea.objects.select_related("usuario").filter(
        fechaRealizacion=hoy, usuario__notificacion=True
    )
    clase = Clase.objects.select_related("usuario").filter(
        fecha=hoy, usuario__notificacion=True
    )
    estudio = Estudio.objects.select_related("usuario").filter(
        fecha=hoy, usuario__notificacion=True
    )

    act_academicas = list(tarea) + list(clase) + list(estudio)

    if not act_academicas:
        return JsonResponse({"mensaje": "No hay tareas para hoy."})

    act_academica_por_usuario = defaultdict(list)
    for act_academica in act_academicas:
        act_academica_por_usuario[act_academica.usuario].append(act_academica)

    if act_academica_por_usuario:
        enviar_recordatorios_tareas(act_academica_por_usuario)

    return JsonResponse(
        {
            "mensaje": "Se enviaron los recordatorios satisfactoriamente.",
        }
    )


def notificar_tareas_fin(request):
    ahora = localtime(now()).replace(second=0, microsecond=0)
    hoy = ahora.date()

    tareas = Tarea.objects.select_related("usuario").filter(
        fechaEntrega=hoy, usuario__notificacion=True
    )

    print(f"Tareas encontradas: {tareas}")

    if not tareas:
        return JsonResponse({"mensaje": "No hay tareas para hoy."})

    usuarios_tareas = []

    for tarea in tareas:
        hora_tarea = tarea.horaEntrega.replace(second=0, microsecond=0)
        fecha_tarea = hoy

        hora_fin_datetime = make_aware(datetime.combine(fecha_tarea, hora_tarea))
        diferencia = hora_fin_datetime - ahora

        if diferencia == timedelta(hours=2):
            usuarios_tareas.append((tarea.usuario, tarea))

    if usuarios_tareas:
        enviar_recordatorios_expiracion(usuarios_tareas)

    return JsonResponse(
        {"mensaje": "Se enviaron los recordatorios satisfactoriamente."}
    )


def notificar_tareas_pendientes(request):

    hoy = date.today()

    tareas = Tarea.objects.select_related("usuario", "estado_actual").filter(
        estado_actual__estado__in=["inicio", "en_desarrollo"],
        usuario__notificacion=True,
        fechaRealizacion__lt=hoy,
    )

    if not tareas:
        return JsonResponse({"mensaje": "No hay tareas pendientes para hoy."})

    tareas_por_usuario = defaultdict(list)
    for tarea in tareas:
        tareas_por_usuario[tarea.usuario].append(tarea)

    enviar_recordatorios_pendientes(tareas_por_usuario)

    return JsonResponse(
        {
            "mensaje": "Se enviaron los recordatorios satisfactoriamente.",
        }
    )
