from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import PreguntaPerfil, RespuestaPerfil, PerfilAprendizaje
from .serializers import PreguntaPerfilSerializer, RespuestaPerfilSerializer, PerfilAprendizajeSerializer
from django.db.models import Sum

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

