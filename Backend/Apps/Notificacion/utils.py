from django.core.mail import EmailMessage, get_connection, send_mail
from django.template.loader import render_to_string
from datetime import date, datetime
from django.conf import settings


def enviar_recordatorios_tareas(usuario_actividades):
    connection = get_connection()
    connection.open()

    emails = []
    for usuario, actividades in usuario_actividades.items():
        subject = f"Tus actividades para hoy ({date.today().strftime('%d/%m/%Y')})"
        message = render_to_string(
            "recordatorio.html",
            {
                "nombre": usuario.first_name,
                "actividades": actividades,
            },
        )
        email = EmailMessage(subject, message, to=[usuario.email])
        email.content_subtype = "html"
        emails.append(email)

    connection.send_messages(emails)
    connection.close()


def enviar_recordatorios_expiracion(usuarios_actividades):
    connection = get_connection()
    connection.open()

    emails = []
    for usuario, actividad in usuarios_actividades:
        subject = f"⏰ Recordatorio: Actividad '{actividad.titulo}' por terminar"
        message = render_to_string(
            "expiracion.html",
            {
                "nombre": usuario.first_name,
                "titulo": actividad.titulo,
                "horaEntrega": actividad.horaEntrega,
            },
        )
        email = EmailMessage(subject, message, to=[usuario.email])
        email.content_subtype = "html"
        email.connection = connection
        emails.append(email)

    connection.send_messages(emails)
    connection.close()


def enviar_recordatorios_pendientes(usuario_actividades):
    connection = get_connection()
    connection.open()

    emails = []
    for usuario, actividades in usuario_actividades.items():
        subject = f"Tareas no completadas ({date.today().strftime('%d/%m/%Y')})"
        message = render_to_string(
            "actIncompleta.html",
            {
                "nombre": usuario.first_name,
                "actividades": actividades,
            },
        )
        email = EmailMessage(subject, message, to=[usuario.email])
        email.content_subtype = "html"
        emails.append(email)

    connection.send_messages(emails)
    connection.close()


def sugerencia_actividad(usuario, actividad):
    verificar_sobrecarga(usuario, actividad)

    if actividad._meta.model_name == "tarea":
        verificar_orden_tareas(usuario, actividad)


def verificar_sobrecarga(usuario, actividad):
    fecha = None

    if hasattr(actividad, "fechaRealizacion"):
        fecha = actividad.fechaRealizacion
    else:
        fecha = actividad.fecha

    total_horas = 0

    tareas = usuario.tareas.filter(fechaRealizacion=fecha)
    clases = usuario.clases.filter(fecha=fecha)
    estudios = usuario.estudios.filter(fecha=fecha)

    print(
        f"Verificando sobrecarga para {usuario.first_name} email: {usuario.email} en {fecha} tareas: {tareas}, clases: {clases}, estudios: {estudios}"
    )

    for act in list(tareas) + list(clases) + list(estudios):
        t_inicio = act.horaInicio
        t_fin = act.horaFin
        delta = datetime.combine(fecha, t_fin) - datetime.combine(fecha, t_inicio)
        total_horas += delta.total_seconds() / 3600

    if total_horas > 10:
        enviar_sugerencia(
            usuario.email,
            "Sugerencia de optimización",
            f"Se tiene sobrecarga de actividades académicas programadas para el día {fecha}. Se sugiere reprogramar alguna(s) actividad(es).",
        )


def verificar_orden_tareas(usuario, tarea_nueva):
    otras_tareas = usuario.tareas.exclude(id=tarea_nueva.id)

    for otra in otras_tareas:
        if (
            tarea_nueva.fechaRealizacion < otra.fechaRealizacion
            and tarea_nueva.fechaEntrega > otra.fechaEntrega
        ):
            # tarea_nueva se hace primero pero se entrega después = mal
            enviar_sugerencia(
                usuario.email,
                "Sugerencia de optimización",
                f'La tarea "{otra.titulo}" es más urgente que la tarea "{tarea_nueva.titulo}". '
                f"Se sugiere priorizar aquella cuya fecha de entrega es más próxima.",
            )
            break

        if (
            tarea_nueva.fechaRealizacion > otra.fechaRealizacion
            and tarea_nueva.fechaEntrega < otra.fechaEntrega
        ):
            # tarea_nueva se hace después pero se entrega antes = mal
            enviar_sugerencia(
                usuario.email,
                "Sugerencia de optimización",
                f'La tarea "{tarea_nueva.titulo}" es más urgente que la tarea "{otra.titulo}". '
                f"Se sugiere priorizar aquella cuya fecha de entrega es más próxima.",
            )
            break


def enviar_sugerencia(email, asunto, mensaje):
    send_mail(
        asunto,
        mensaje,
        settings.EMAIL_HOST_USER,
        [email],
    )
