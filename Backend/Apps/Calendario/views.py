from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from .models import Tarea, Clase, Estudio, ActividadNoAcademica
from .serializers import (
    TareaSerializer,
    ClaseSerializer,
    EstudioSerializer,
    ActividadNoAcademicaSerializer,
)
from .serializers import (
    TareaResumenSerializer,
    EstudioResumenSerializer,
    ClaseResumenSerializer,
    ActividadNoAcademicaResumenSerializer,
)
from rest_framework.views import APIView
from Apps.Notificacion.utils import sugerencia_actividad


# ViewSet para Tareas
class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.select_related('estado_actual').all()
    serializer_class = TareaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        tarea = serializer.save(usuario=self.request.user)
        sugerencia_actividad(self.request.user, tarea)

    def update(self, request, *args, **kwargs):
        if request.method == "PUT":
            return Response(
                {"detail": "Método PUT no permitido, usa PATCH para actualizaciones"},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"mensaje": "Tarea creada con éxito", "tarea": serializer.data},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"mensaje": "Tarea eliminada con éxito"}, status=status.HTTP_200_OK
        )


# Operación	                   Método HTTP	                    Ruta completa
# Lista de tareas	              GET	          http://localhost:8000/calendario/api/tareas/
# Crear tarea	                  POST	          http://localhost:8000/calendario/api/tareas/
# Detalle de una tarea	          GET	          http://localhost:8000/calendario/api/tareas/<id>/
# Actualizar tarea	             PATCH	          http://localhost:8000/calendario/api/tareas/<id>/
# Eliminar tarea	                 DELETE	          http://localhost:8000/calendario/api/tareas/<id>/


# ViewSet para Clases
class ClaseViewSet(viewsets.ModelViewSet):
    queryset = Clase.objects.all()
    serializer_class = ClaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        clase = serializer.save(usuario=self.request.user)
        sugerencia_actividad(self.request.user, clase)

    def update(self, request, *args, **kwargs):
        if request.method == "PUT":
            return Response(
                {"detail": "Método PUT no permitido, usa PATCH para actualizaciones"},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"mensaje": "Clase creada con éxito", "clase": serializer.data},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"mensaje": "Clase eliminada con éxito"}, status=status.HTTP_200_OK
        )


# Operación	                  Método HTTP	                    Ruta completa
# Lista de clases	             GET	          http://localhost:8000/calendario/api/clases/
# Crear clase	                 POST	          http://localhost:8000/calendario/api/clases/
# Detalle de una clase	         GET	          http://localhost:8000/calendario/api/clases/<id>/
# Actualizar clase	             PATCH	          http://localhost:8000/calendario/api/clases/<id>/
# Eliminar clase	                 DELETE	          http://localhost:8000/calendario/api/clases/<id>/


# ViewSet para Estudios
class EstudioViewSet(viewsets.ModelViewSet):
    queryset = Estudio.objects.all()
    serializer_class = EstudioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        estudio = serializer.save(usuario=self.request.user)
        sugerencia_actividad(self.request.user, estudio)

    def update(self, request, *args, **kwargs):
        if request.method == "PUT":
            return Response(
                {"detail": "Método PUT no permitido, usa PATCH para actualizaciones"},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"mensaje": "Estudio creado con éxito", "estudio": serializer.data},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"mensaje": "Estudio eliminado con éxito"}, status=status.HTTP_200_OK
        )


# Operación	                 Método HTTP	                     Ruta completa
# Lista de estudios	            GET	             http://localhost:8000/calendario/api/estudios/
# Crear estudio	                POST	         http://localhost:8000/calendario/api/estudios/
# Detalle de un estudio	        GET	             http://localhost:8000/calendario/api/estudios/<id>/
# Actualizar estudio	            PATCH	         http://localhost:8000/calendario/api/estudios/<id>/
# Eliminar estudio	            DELETE	         http://localhost:8000/calendario/api/estudios/<id>/


# ViewSet para Actividades No Académicas
class ActividadNoAcademicaViewSet(viewsets.ModelViewSet):
    queryset = ActividadNoAcademica.objects.all()
    serializer_class = ActividadNoAcademicaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def update(self, request, *args, **kwargs):
        if request.method == "PUT":
            return Response(
                {"detail": "Método PUT no permitido, usa PATCH para actualizaciones"},
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )
        return super().update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "mensaje": "Actividad no académica creada con éxito",
                "actividad": serializer.data,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"mensaje": "Actividad no académica eliminada con éxito"},
            status=status.HTTP_200_OK,
        )


# Operación	                                   Método HTTP	                          Ruta completa
# Lista de actividades no académicas	              GET	           http://localhost:8000/calendario/api/actividadesNoAcademicas/
# Crear actividad no académica	                  POST	           http://localhost:8000/calendario/api/actividadesNoAcademicas/
# Detalle de una actividad	                      GET	           http://localhost:8000/calendario/api/actividadesNoAcademicas/<id>/
# Actualizar actividad	                          PATCH	           http://localhost:8000/calendario/api/actividadesNoAcademicas/<id>/
# Eliminar actividad	                              DELETE	       http://localhost:8000/calendario/api/actividadesNoAcademicas/<id>/


class ActividadesDeHoyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        hoy = date.today()

        tareas = Tarea.objects.filter(usuario=usuario, fechaRealizacion=hoy)
        estudios = Estudio.objects.filter(usuario=usuario, fecha=hoy)
        clases = Clase.objects.filter(usuario=usuario, fecha=hoy)
        actividades_no_acad = ActividadNoAcademica.objects.filter(
            usuario=usuario, fecha=hoy
        )

        tareas_serializadas = TareaResumenSerializer(tareas, many=True).data
        estudios_serializados = EstudioResumenSerializer(estudios, many=True).data
        clases_serializadas = ClaseResumenSerializer(clases, many=True).data
        actividades_serializadas = ActividadNoAcademicaResumenSerializer(
            actividades_no_acad, many=True
        ).data

        todas = (
            [{"tipo": "Tarea", **item} for item in tareas_serializadas]
            + [{"tipo": "Estudio", **item} for item in estudios_serializados]
            + [{"tipo": "Clase", **item} for item in clases_serializadas]
            + [
                {"tipo": "ActividadNoAcademica", **item}
                for item in actividades_serializadas
            ]
        )

        # Ordenar por horaInicio (convertido a string para comparación)
        todas_ordenadas = sorted(todas, key=lambda x: x["horaInicio"])

        return Response(todas_ordenadas)
