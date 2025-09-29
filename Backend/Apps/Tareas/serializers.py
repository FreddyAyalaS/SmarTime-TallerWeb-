from rest_framework import serializers
from .models import EstadoTarea

class EstadoTareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoTarea
        fields = ['id', 'tarea', 'estado', 'fecha_estado']

    def validate_estado(self, nuevo_estado):
        estado_actual = self.instance.estado
        orden = ['inicio', 'en_desarrollo', 'finalizado', 'entregado']

        if orden.index(nuevo_estado) != orden.index(estado_actual) + 1:
            raise serializers.ValidationError(
                f"No puedes cambiar de '{estado_actual}' a '{nuevo_estado}' directamente."
            )
        return nuevo_estado