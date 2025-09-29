from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from .views import (
    RegistroUsuarioAPIView,
    LoginUsuarioAPIView,
    LogoutUsuarioAPIView,
    PasswordResetRequestAPIView,
    SetNewPasswordAPIView,
)

urlpatterns = [
    path('registro/', RegistroUsuarioAPIView.as_view(), name='registro'),
    path('login/', LoginUsuarioAPIView.as_view(), name='login'),
    path('logout/', LogoutUsuarioAPIView.as_view(), name='logout'),
    path('solicitarNuevaContrasena/', PasswordResetRequestAPIView.as_view(), name='solicitarNuevaContrasena'),
    path('generarNuevaContrasena/', SetNewPasswordAPIView.as_view(), name='generarNuevaContrasena'),
    
    # Login (obtiene token de acceso y refresh)
    # url completa:  http://localhost:8000/autenticacion/token/
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Refrescar token de acceso usando refresh token
    # url completa:  http://localhost:8000/autenticacion/token/refresh/
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    
    # Logout (revocar refresh token)
    # url completa:  http://localhost:8000/autenticacion/token/logout/
    path('token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
]
