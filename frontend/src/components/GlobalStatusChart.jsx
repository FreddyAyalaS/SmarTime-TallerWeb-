// src/components/GlobalStatusChart.jsx
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getTareas } from '../services/calendarService'; // <- Ya trae campo `estado`
import '../styles/GlobalStatusChart.css';

const COLORS = {
  por_hacer: '#F44336',                // Rojo
  en_proceso_dentro: '#FDD835',        // Amarillo
  en_proceso_fuera: '#FB8C00',         // Naranja
  finalizado_dentro: '#4CAF50',        // Verde
  finalizado_fuera: '#42A5F5',         // Azul
};

const LABELS = {
  por_hacer: 'Por hacer',
  en_proceso_dentro: 'En proceso dentro de la fecha',
  en_proceso_fuera: 'En proceso fuera de la fecha',
  finalizado_dentro: 'Finalizado dentro de la fecha',
  finalizado_fuera: 'Finalizado fuera de la fecha',
};

const CustomLegend = ({ payload }) => (
  <ul className="custom-legend">
    {payload.map((entry, index) => (
      <li key={`item-${index}`}>
        <span className="legend-dot" style={{ backgroundColor: entry.color }}></span>
        <span className="legend-label">{entry.label}</span>
        <span className="legend-percent">{entry.percent} %</span>
      </li>
    ))}
  </ul>
);

const GlobalStatusChart = () => {
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const allTasks = await getTareas(); // Devuelve tareas con campo `estado`
      console.log("🚨 Tareas recibidas del calendarService:", allTasks);

      const today = new Date().toISOString().split('T')[0];

      const counters = {
        por_hacer: 0,
        en_proceso_dentro: 0,
        en_proceso_fuera: 0,
        finalizado_dentro: 0,
        finalizado_fuera: 0,
      };

      allTasks.forEach(task => {
        const estado = task.estado || 'inicio';
        const fechaEntrega = task.fechaEntrega;
        const vencida = fechaEntrega < today;

        switch (estado) {
          case 'inicio':
            counters.por_hacer++;
            break;
          case 'en_desarrollo':
            vencida ? counters.en_proceso_fuera++ : counters.en_proceso_dentro++;
            break;
          case 'finalizado':
            vencida ? counters.finalizado_fuera++ : counters.finalizado_dentro++;
            break;
          default:
            counters.por_hacer++;
        }
      });

      const total = Object.values(counters).reduce((sum, val) => sum + val, 0);

      const chartData = Object.entries(counters).map(([key, value]) => ({
        label: LABELS[key],
        value,
        color: COLORS[key],
        percent: total ? Math.round((value / total) * 100) : 0,
      }));

      setStatusData(chartData);
    };

    fetchData();
  }, []);

  return (
    <div className="global-status-chart-container">
      <div className="responsive-chart">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label={({ index }) => `${statusData[index].percent}%`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {statusData.length > 0 && <CustomLegend payload={statusData} />}
    </div>
  );
};

export default GlobalStatusChart;
