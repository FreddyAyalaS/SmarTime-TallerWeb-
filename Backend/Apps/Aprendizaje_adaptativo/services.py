from .models import PerfilAprendizaje, PrioridadMetodoTema, RecomendacionEstudio


def recomendar_metodo(usuario, tema):
    # Recuperar perfil del usuario
    perfil = PerfilAprendizaje.objects.get(usuario=usuario)

    metodo1 = perfil.metodo_principal
    metodo2 = perfil.metodo_secundario

    # Recuperar prioridades del tema
    prioridades = PrioridadMetodoTema.objects.get(tema=tema)

    lista_prioridades = [
        prioridades.prioridad_1,
        prioridades.prioridad_2,
        prioridades.prioridad_3,
    ]

    # Match inteligente
    if metodo1 in lista_prioridades:
        metodo_elegido = metodo1
    elif metodo2 in lista_prioridades:
        metodo_elegido = metodo2
    else:
        metodo_elegido = prioridades.prioridad_1  # fallback teórico

    razon = (
        f"El tema '{tema.nombre}' recomienda como prioridad el método {metodo_elegido}. "
        f"Se eligió este método porque coincide con tu perfil de aprendizaje "
        f"({metodo1} como principal y {metodo2} como secundario)."
    )

    # Guardar recomendación
    RecomendacionEstudio.objects.create(
        usuario=usuario,
        tema=tema,
        metodo_recomendado=metodo_elegido,
        razon=razon
    )

    return metodo_elegido, razon
