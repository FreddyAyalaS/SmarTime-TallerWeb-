from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UsuarioPersonalizadoSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .serializers import FotoPerfilSerializer
class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioPersonalizadoSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UsuarioPersonalizadoSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    def put(self, request):
        serializer = UsuarioPersonalizadoSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UploadProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  

    def patch(self, request):
        user = request.user
        file = request.data.get('foto_perfil')

        if file:
            user.foto_perfil = file
            user.save()
            return Response({'message': 'Foto actualizada correctamente'}, status=200)
        return Response({'error': 'No se proporcionó ninguna imagen'}, status=400)
    

    
class FotoPerfilView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Necesario para manejar archivos

    def put(self, request):
        perfil = request.user.perfil
        serializer = FotoPerfilSerializer(perfil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"foto_perfil": serializer.data['foto_perfil']})
        return Response(serializer.errors, status=400)