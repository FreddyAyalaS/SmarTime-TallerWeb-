// src/components/ModalPlanEstudio.jsx
import React from "react";

const etiquetaSmall = { fontSize: '13px', color: '#6b7280' };
const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 6px 20px rgba(15, 23, 42, 0.12)',
  padding: '18px',
  marginBottom: 12,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

export default function ModalPlanEstudio({ plan, onAceptar, onRechazar }) {
  if (!plan) return null;

  // Normalizar nombre del array de sesiones que envíe el backend
  const sesiones =
    Array.isArray(plan.sesiones) ? plan.sesiones :
    Array.isArray(plan.bloques) ? plan.bloques :
    Array.isArray(plan.sesiones_generadas) ? plan.sesiones_generadas : // fallback
    [];

  const formatDateTime = (fecha, hora) => {
    if (!fecha && !hora) return '';
    // si hora incluye segundos o viene como "09:00:00", cortar a HH:MM
    const h = hora ? hora.toString().slice(0,5) : '';
    return `${fecha || ''}${h ? ' - ' + h : ''}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(20,20,20,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{ width: '66%', maxWidth: 900, maxHeight: '84vh', overflow: 'hidden' }}>
        <div style={{ background: '#ffffff', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #eef2f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>Plan de Estudio Inteligente</h3>
            <button onClick={onRechazar} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
          </div>

          <div style={{ padding: 18, maxHeight: '64vh', overflowY: 'auto' }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '6px 0', ...etiquetaSmall }}><strong>Plan generado</strong></p>
              <p style={{ margin: '6px 0', color:'#0f172a' }}>{plan.mensaje || 'Plan de estudio generado'}</p>

              {/* Ejemplos de campos resumen si existen */}
              {plan.planificacion && (
                <div style={{ marginTop: 10, ...etiquetaSmall }}>
                  <div><strong>Tema ID:</strong> {plan.planificacion?.tema_dificultad || plan.tema_id || '-'}</div>
                  <div><strong>Fecha inicio:</strong> {plan.planificacion?.fecha_inicio || plan.fecha_inicio}</div>
                  <div><strong>Fecha fin estimada:</strong> {plan.planificacion?.fecha_fin || plan.fecha_fin}</div>
                  <div><strong>Total sesiones generadas:</strong> {plan.sesiones_generadas ?? plan.total_sesiones ?? sesiones.length}</div>
                </div>
              )}
            </div>

            {/* Lista de sesiones / bloques */}
            <div>
              {sesiones.length === 0 && (
                <p style={{ color: '#6b7280' }}>No hay sesiones detalladas que mostrar.</p>
              )}

              {sesiones.map((s, idx) => {
                // s puede tener distintos nombres de campos según backend
                const tipo = s.tipo_sesion || s.tipo || s.nombre || s.tarea || 'sesión';
                const numero = s.numero_sesion ?? s.numero ?? s.id ?? '';
                const fecha = s.fecha || s.fecha_inicio || s.inicioFecha || s.date || '';
                const horaInicio = s.hora_inicio || s.hora || s.inicio || s.hora_inicio_str || '';
                const horaFin = s.hora_fin || s.fin || s.hora_fin_str || '';

                return (
                  <div key={idx} style={cardStyle}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', textTransform:'capitalize' }}>{tipo}</div>
                      {numero !== '' && <div style={{ fontSize: 12, color: '#94a3b8' }}>Nº {numero}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: '#0f172a' }}>{formatDateTime(fecha, horaInicio)}</div>
                      {horaFin && <div style={{ fontSize: 12, color: '#6b7280' }}>Fin: {horaFin.slice(0,5)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '12px 18px', borderTop: '1px solid #eef2f6', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button onClick={onRechazar} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer'
            }}>Rechazar</button>

            <button onClick={onAceptar} style={{
              padding: '8px 14px', borderRadius: 8, border: 'none', background: '#10b981', color:'#fff', cursor:'pointer', boxShadow:'0 6px 18px rgba(16,185,129,0.14)'
            }}>Aceptar plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
