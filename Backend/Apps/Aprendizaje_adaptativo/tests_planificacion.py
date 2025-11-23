"""
Tests para la funcionalidad de Planificación Adaptativa Ponderada (HU 21)
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, time
from .models import Curso, Tema, TemaDificultad, SesionEstudio, PlanificacionAdaptativa

User = get_user_model()


class PlanificacionAdaptativaTests(TestCase):
    """Tests para la planificación adaptativa ponderada"""
    
    def setUp(self):
        """Configuración inicial para los tests"""
        # Crear usuario de prueba
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Configurar cliente API
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Crear curso y tema de prueba
        self.curso = Curso.objects.create(nombre='Matemáticas')
        self.tema = Tema.objects.create(
            curso=self.curso,
            nombre='Cálculo Diferencial'
        )
    
    def test_asignar_dificultad_a_tema(self):
        """Test: Asignar dificultad a un tema"""
        data = {
            'tema_id': self.tema.id,
            'dificultad': 'alta',
            'metodo_estudio': 'Pomodoro'
        }
        
        response = self.client.post('/aprendizaje_adaptativo/tema-dificultad/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mensaje'], 'Dificultad asignada con éxito')
        self.assertEqual(response.data['tema_dificultad']['dificultad'], 'alta')
        self.assertEqual(response.data['tema_dificultad']['metodo_estudio'], 'Pomodoro')
        
        # Verificar que se creó en la base de datos
        tema_dificultad = TemaDificultad.objects.get(usuario=self.user, tema=self.tema)
        self.assertEqual(tema_dificultad.dificultad, 'alta')
    
    def test_actualizar_dificultad_existente(self):
        """Test: Actualizar dificultad de un tema ya asignado"""
        # Crear dificultad inicial
        TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='baja',
            metodo_estudio='Feynman'
        )
        
        # Actualizar a dificultad alta
        data = {
            'tema_id': self.tema.id,
            'dificultad': 'alta',
            'metodo_estudio': 'Pomodoro'
        }
        
        response = self.client.post('/aprendizaje_adaptativo/tema-dificultad/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mensaje'], 'Dificultad actualizada con éxito')
        
        # Verificar que se actualizó
        tema_dificultad = TemaDificultad.objects.get(usuario=self.user, tema=self.tema)
        self.assertEqual(tema_dificultad.dificultad, 'alta')
        self.assertEqual(tema_dificultad.metodo_estudio, 'Pomodoro')
    
    def test_generar_planificacion_dificultad_alta(self):
        """Test: Generar planificación para tema de dificultad alta"""
        # Crear tema con dificultad alta
        tema_dificultad = TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='alta',
            metodo_estudio='Pomodoro'
        )
        
        data = {
            'tema_dificultad_id': tema_dificultad.id,
            'fecha_inicio': '2025-11-25',
            'hora_preferida': '09:00',
            'dias_disponibles': ['lunes', 'miercoles', 'viernes']
        }
        
        response = self.client.post('/aprendizaje_adaptativo/generar-planificacion/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mensaje'], 'Planificación generada con éxito')
        
        # Verificar que se generaron más sesiones (dificultad alta = 1.5x)
        planificacion = response.data['planificacion']
        self.assertGreater(planificacion['total_sesiones'], 6)  # Más de 6 sesiones base
        
        # Verificar que las sesiones se guardaron en la BD
        sesiones = SesionEstudio.objects.filter(usuario=self.user)
        self.assertGreater(sesiones.count(), 0)
    
    def test_generar_planificacion_dificultad_baja(self):
        """Test: Generar planificación para tema de dificultad baja"""
        # Crear tema con dificultad baja
        tema_dificultad = TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='baja',
            metodo_estudio='Pomodoro'
        )
        
        data = {
            'tema_dificultad_id': tema_dificultad.id,
            'fecha_inicio': '2025-11-25',
            'hora_preferida': '09:00',
            'dias_disponibles': ['lunes', 'miercoles', 'viernes']
        }
        
        response = self.client.post('/aprendizaje_adaptativo/generar-planificacion/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar que se generaron menos sesiones (dificultad baja = 0.7x)
        planificacion = response.data['planificacion']
        self.assertLess(planificacion['total_sesiones'], 6)  # Menos de 6 sesiones base
    
    def test_metodo_pomodoro_aplica_reglas(self):
        """Test: Verificar que método Pomodoro aplica sus reglas"""
        tema_dificultad = TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='media',
            metodo_estudio='Pomodoro'
        )
        
        data = {
            'tema_dificultad_id': tema_dificultad.id,
            'fecha_inicio': '2025-11-25',
            'hora_preferida': '09:00',
            'dias_disponibles': ['lunes']
        }
        
        response = self.client.post('/aprendizaje_adaptativo/generar-planificacion/', data)
        
        # Verificar que las sesiones tienen duración Pomodoro (25 min)
        sesiones_estudio = [s for s in response.data['planificacion']['sesiones'] 
                           if s['tipo_sesion'] == 'estudio']
        
        self.assertTrue(any(s['duracion_minutos'] == 25 for s in sesiones_estudio))
    
    def test_editar_sesion_manualmente(self):
        """Test: Editar manualmente una sesión de estudio"""
        # Crear tema con dificultad y generar planificación
        tema_dificultad = TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='media',
            metodo_estudio='Pomodoro'
        )
        
        sesion = SesionEstudio.objects.create(
            usuario=self.user,
            tema_dificultad=tema_dificultad,
            tipo_sesion='estudio',
            fecha=date(2025, 11, 25),
            hora_inicio=time(9, 0),
            hora_fin=time(9, 25),
            duracion_minutos=25,
            numero_sesion=1
        )
        
        # Editar la sesión
        data = {
            'fecha': '2025-11-26',
            'hora_inicio': '10:00:00',
            'hora_fin': '10:30:00'
        }
        
        response = self.client.patch(f'/aprendizaje_adaptativo/sesiones/{sesion.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mensaje'], 'Sesión actualizada con éxito')
        
        # Verificar que se actualizó
        sesion.refresh_from_db()
        self.assertEqual(str(sesion.fecha), '2025-11-26')
        self.assertEqual(sesion.duracion_minutos, 30)  # Recalculado automáticamente
    
    def test_marcar_sesion_completada(self):
        """Test: Marcar una sesión como completada"""
        tema_dificultad = TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='media',
            metodo_estudio='Pomodoro'
        )
        
        sesion = SesionEstudio.objects.create(
            usuario=self.user,
            tema_dificultad=tema_dificultad,
            tipo_sesion='estudio',
            fecha=date(2025, 11, 25),
            hora_inicio=time(9, 0),
            hora_fin=time(9, 25),
            duracion_minutos=25,
            numero_sesion=1
        )
        
        # Marcar como completada
        response = self.client.patch(
            f'/aprendizaje_adaptativo/sesiones/{sesion.id}/',
            {'completada': True}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        sesion.refresh_from_db()
        self.assertTrue(sesion.completada)
    
    def test_eliminar_sesion(self):
        """Test: Eliminar una sesión de estudio"""
        tema_dificultad = TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='media',
            metodo_estudio='Pomodoro'
        )
        
        sesion = SesionEstudio.objects.create(
            usuario=self.user,
            tema_dificultad=tema_dificultad,
            tipo_sesion='estudio',
            fecha=date(2025, 11, 25),
            hora_inicio=time(9, 0),
            hora_fin=time(9, 25),
            duracion_minutos=25,
            numero_sesion=1
        )
        
        sesion_id = sesion.id
        
        response = self.client.delete(f'/aprendizaje_adaptativo/sesiones/{sesion_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mensaje'], 'Sesión eliminada con éxito')
        
        # Verificar que se eliminó
        self.assertFalse(SesionEstudio.objects.filter(id=sesion_id).exists())
    
    def test_filtrar_sesiones_por_fecha(self):
        """Test: Filtrar sesiones por rango de fechas"""
        tema_dificultad = TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='media',
            metodo_estudio='Pomodoro'
        )
        
        # Crear sesiones en diferentes fechas
        SesionEstudio.objects.create(
            usuario=self.user,
            tema_dificultad=tema_dificultad,
            tipo_sesion='estudio',
            fecha=date(2025, 11, 25),
            hora_inicio=time(9, 0),
            hora_fin=time(9, 25),
            duracion_minutos=25,
            numero_sesion=1
        )
        
        SesionEstudio.objects.create(
            usuario=self.user,
            tema_dificultad=tema_dificultad,
            tipo_sesion='estudio',
            fecha=date(2025, 12, 5),
            hora_inicio=time(9, 0),
            hora_fin=time(9, 25),
            duracion_minutos=25,
            numero_sesion=2
        )
        
        # Filtrar solo noviembre
        response = self.client.get(
            '/aprendizaje_adaptativo/sesiones/?fecha_inicio=2025-11-01&fecha_fin=2025-11-30'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Solo una sesión en noviembre
    
    def test_listar_planificaciones_usuario(self):
        """Test: Listar todas las planificaciones del usuario"""
        tema_dificultad = TemaDificultad.objects.create(
            usuario=self.user,
            tema=self.tema,
            dificultad='media',
            metodo_estudio='Pomodoro'
        )
        
        # Crear planificación
        PlanificacionAdaptativa.objects.create(
            usuario=self.user,
            tema_dificultad=tema_dificultad,
            fecha_inicio=date(2025, 11, 25),
            fecha_fin=date(2025, 12, 5),
            total_sesiones=6
        )
        
        response = self.client.get('/aprendizaje_adaptativo/planificaciones/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['total_sesiones'], 6)
