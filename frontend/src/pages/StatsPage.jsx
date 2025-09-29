import React, { useEffect, useState } from 'react';
import SummaryCard from '../components/SummaryCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import axios from 'axios';
import starImg from '../assets/Icons/star.png';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import '../styles/StatsPage.css';



const API_BASE = 'http://localhost:8000';

const StatsPage = () => {
  // Estado para tareas completadas/pendientes
  const [tareasStats, setTareasStats] = useState(null);

  // Estado para historial de estrellas
  const [historialEstrellas, setHistorialEstrellas] = useState([]);

  // Estado para filtros de fecha (solo para estrellas)
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estado para estado de tareas (completadas/pendientes)
  const [estadoTareas, setEstadoTareas] = useState(null);


  // Cargar tareas completadas/pendientes al montar
  useEffect(() => {
    axios.get(`${API_BASE}/tareas/api/tareas-completadas-pendientes/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    })
      .then(res => setTareasStats(res.data))
      .catch(() => setTareasStats(null));
  }, []);

  // Cargar historial de estrellas (todas las semanas)
  useEffect(() => {
    axios.get(`${API_BASE}/gamificacion/api/historial-estrellas/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    })
      .then(res => setHistorialEstrellas(res.data))
      .catch(() => setHistorialEstrellas([]));
  }, []);


  // Cargar estado de tareas semanales (completadas/pendientes)
  useEffect(() => {
    axios.get(`${API_BASE}/estadisticas/api/estadoTareasSemanal/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    })
      .then(res => setEstadoTareas(res.data))
      .catch(() => setEstadoTareas(null));
  }, []);

  // Filtrar historial de estrellas por fechas seleccionadas
  const estrellasFiltradas = historialEstrellas.filter(item => {
    if (!fechaInicio && !fechaFin) return true;
    const ini = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;
    const semana = new Date(item.semana_inicio);
    return (!ini || semana >= ini) && (!fin || semana <= fin);
  });

  const totalEstrellas = historialEstrellas.reduce((acc, item) => acc + item.estrellas, 0);

  const COLORS = [
    "#FF4D4F", // Por hacer - rojo
    "#FFD600", // En proceso dentro de la fecha - amarillo
    "#FF9100", // En proceso fuera de la fecha - naranja
    "#00C853", // Finalizado dentro de la fecha - verde
    "#2979FF", // Finalizado fuera de la fecha - azul
  ];

  const ESTADO_LABELS = [
    { key: "por_hacer", label: "Por hacer" },
    { key: "en_proceso_dentro_fecha", label: "En proceso dentro de la fecha" },
    { key: "en_proceso_fuera_fecha", label: "En proceso afuera de la fecha" },
    { key: "finalizado_dentro_fecha", label: "Finalizado dentro de la fecha" },
    { key: "finalizado_fuera_fecha", label: "Finalizado afuera de la fecha" },
  ];

  const dataDona = estadoTareas
    ? ESTADO_LABELS.map((item, idx) => ({
      name: item.label,
      value: parseFloat((estadoTareas[item.key] || "0").replace('%', '')),
      color: COLORS[idx]
    }))
    : [];

  return (
    <div className="stats-page">
      <div className="stats-grid">

        {/* CARD 1: Tareas completadas vs pendientes */}
        <div className="stats-grid-cell">
          <SummaryCard title="Tareas por Curso" className="card-stats">
            {tareasStats ? (
              <BarChart width={300} height={200} data={[
                { name: 'Completadas', value: tareasStats.completadas },
                { name: 'Pendientes', value: tareasStats.pendientes }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            ) : (
              <p>Cargando...</p>
            )}
          </SummaryCard>
        </div>

        {/* CARD 2: Estado Global de Actividades */}
        <div className="stats-grid-cell">
          <SummaryCard title="Estado Global de Actividades" className="card-stats">
            {dataDona.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <PieChart width={180} height={180}>
                  <Pie
                    data={dataDona}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    label={false}
                  >
                    {dataDona.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div>
                  {dataDona.map((entry, idx) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: entry.color,
                        marginRight: 8
                      }} />
                      <span style={{ minWidth: 180 }}>{entry.name}</span>
                      <span style={{ fontWeight: 'bold', marginLeft: 8 }}>{estadoTareas[ESTADO_LABELS[idx].key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>Cargando...</p>
            )}
          </SummaryCard>
        </div>

        {/* CARD 3: Progreso acumulativo de estrellas */}
        <div className="stats-grid-cell">
          <SummaryCard title="Progreso Acumulativo de Estrellas" className="card-stats">
            <div style={{ marginBottom: 10 }}>
              <label>Fecha inicio: <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></label>
              <label style={{ marginLeft: 10 }}>Fecha fin: <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></label>
            </div>
            {estrellasFiltradas.length > 0 ? (
              <LineChart width={350} height={200} data={estrellasFiltradas.map(item => ({
                fecha: item.semana_inicio,
                estrellas: item.estrellas
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="estrellas" stroke="#8884d8" />
              </LineChart>
            ) : (
              <p>No hay datos para mostrar</p>
            )}
          </SummaryCard>
        </div>

        {/* CARD 4: (puedes dejarla igual o poner otra estadística) */}
        <div className="stats-grid-cell">
          <SummaryCard title="Score:" className="card-stats" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: '#888' }}>
                {totalEstrellas} <span style={{ fontSize: 18, fontWeight: 'normal' }}>estrellas</span>
              </span>
              <img src={starImg} alt="estrella" style={{ width: 90, marginTop: 10 }} />
            </div>
          </SummaryCard>
        </div>

      </div>
    </div>
  );
};

export default StatsPage;