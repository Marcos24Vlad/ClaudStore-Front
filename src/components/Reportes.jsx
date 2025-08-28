import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/Reportes.css";

export default function Reportes() {
  // 🔹 Fechas por defecto: últimos 30 días
  const [fechaFin, setFechaFin] = useState(new Date());
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [reportes, setReportes] = useState(null);
  const [periodo, setPeriodo] = useState("mes"); // dia, semana, mes, anio
  const [loading, setLoading] = useState(false);

  // 🔹 useCallback asegura que la función no cambie en cada render
  const cargarReportes = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return;

    try {
      setLoading(true);
      const url = `http://192.168.100.165:8000/reportes/rango?desde=${fechaInicio.toISOString()}&hasta=${fechaFin.toISOString()}&periodo=${periodo}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar reportes");

      const data = await res.json();

      // Transformación de datos para gráfico
      const ventasPorPeriodo = data.ventas_por_periodo
        .map((item) => ({
          fecha: `${item.periodo.anio}-${String(item.periodo.mes).padStart(
            2,
            "0"
          )}-${String(item.periodo.dia || 1).padStart(2, "0")}`,
          inversion: Number(item.inversion),
          generado: Number(item.generado),
          ganancia_neta: Number(item.ganancia_neta),
        }))
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordena cronológicamente

      setReportes({ ...data, ventas_por_periodo: ventasPorPeriodo });
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los reportes");
      setReportes({
        // fallback vacío
        inversion_total: 0,
        generado_total: 0,
        ganancia_neta: 0,
        top5: [],
        ventas_por_periodo: [],
      });
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, periodo]);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  const reiniciarReportes = async () => {
    if (!window.confirm("⚠️ ¿Seguro que quieres reiniciar estos reportes?"))
      return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://192.168.100.165:8000/reportes/reiniciar?desde=${fechaInicio.toISOString()}&hasta=${fechaFin.toISOString()}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Error al reiniciar los reportes");

      alert("✅ Reportes reiniciados correctamente");
      cargarReportes();
    } catch (error) {
      console.error(error);
      alert("❌ No se pudieron reiniciar los reportes");
    } finally {
      setLoading(false);
    }
  };

  if (!reportes) return <p>Cargando...</p>;

  return (
    <div className="reportes-container">
      <h1>📊 Reportes</h1>

      {/* Filtros */}
      <div className="filtros">
        <DatePicker
          selected={fechaInicio}
          onChange={setFechaInicio}
          placeholderText="Fecha inicio"
        />
        <DatePicker
          selected={fechaFin}
          onChange={setFechaFin}
          placeholderText="Fecha fin"
        />
        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
          <option value="anio">Año</option>
        </select>
        <button onClick={cargarReportes} disabled={loading}>
          {loading ? "Cargando..." : "Aplicar"}
        </button>
        <button
          onClick={reiniciarReportes}
          className="btn-reset"
          disabled={loading}
        >
          Reiniciar
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="cards">
        <div className="card">💰 Inversión: ${reportes.inversion_total}</div>
        <div className="card">📈 Generado: ${reportes.generado_total}</div>
        <div className="card">🏆 Ganancia neta: ${reportes.ganancia_neta}</div>
      </div>

      {/* Top 5 productos */}
      <h2>🔥 Top 5 más vendidos</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportes.top5}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="left"
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="vendidos" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ventas por tiempo */}
      <h2>📅 Ventas por periodo</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportes.ventas_por_periodo}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend
              verticalAlign="top"
              align="left"
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line type="monotone" dataKey="generado" stroke="#8884d8" />
            <Line type="monotone" dataKey="inversion" stroke="#82ca9d" />
            <Line type="monotone" dataKey="ganancia_neta" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
