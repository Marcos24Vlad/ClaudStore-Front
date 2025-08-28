import React, { useState, useEffect, useMemo } from "react";
import "../css/Registrar.css";

const API_BASE = "http://192.168.100.165:8000";

export default function RegistrarProductos() {
  const [productos, setProductos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    id_producto: null,
    nombre: "",
    costo: "",
    precio_venta: "",
    stock: "",
    imagen: null,
    imagen_url: "",
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/productos`);
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      const file = files?.[0] ?? null;
      setFormData((s) => ({ ...s, imagen: file }));

      if (preview) URL.revokeObjectURL(preview);

      if (file) setPreview(URL.createObjectURL(file));
      else setPreview(null);
    } else {
      setFormData((s) => ({ ...s, [name]: value }));
    }

    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.nombre.trim()) errors.push("El nombre es requerido");
    if (!formData.costo || parseFloat(formData.costo) <= 0) errors.push("El costo debe ser mayor a 0");
    if (!formData.precio_venta || parseFloat(formData.precio_venta) <= 0) errors.push("El precio de venta debe ser mayor a 0");
    if (!formData.stock || parseInt(formData.stock) < 0) errors.push("El stock no puede ser negativo");

    if (errors.length > 0) {
      setError(errors.join(". "));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fd = new FormData();
    fd.append("nombre", formData.nombre.trim());
    fd.append("costo", formData.costo);
    fd.append("precio_venta", formData.precio_venta);
    fd.append("stock", formData.stock);
    if (formData.imagen) fd.append("imagen", formData.imagen);

    try {
      setLoading(true);
      const url = modoEdicion ? `${API_BASE}/productos/${formData.id_producto}` : `${API_BASE}/productos`;
      const method = modoEdicion ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error en la operación");
      }

      await cargarProductos();
      handleCancelar();
      setSuccess(modoEdicion ? "Producto actualizado exitosamente" : "Producto registrado exitosamente");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error guardando producto:", err);
      setError("Hubo un problema al guardar el producto. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (p) => {
    setModoEdicion(true);
    setFormData({
      id_producto: p.id_producto,
      nombre: p.nombre ?? "",
      costo: p.costo ?? "",
      precio_venta: p.precio_venta ?? "",
      stock: p.stock ?? "",
      imagen: null,
      imagen_url: p.imagen_url ?? "",
    });

    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }

    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDesactivar = async (id, nombre) => {
    if (!window.confirm(`⚠️ ¿Seguro que quieres desactivar "${nombre}"?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/productos/${id}`, {
        method: "DELETE", // backend debe desactivar en lugar de borrar
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al desactivar");
      }

      await cargarProductos();
      setSuccess("Producto desactivado exitosamente");
    } catch (err) {
      console.error("Error desactivando:", err);
      setError("No se pudo desactivar el producto. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setModoEdicion(false);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFormData({
      id_producto: null,
      nombre: "",
      costo: "",
      precio_venta: "",
      stock: "",
      imagen: null,
      imagen_url: "",
    });
    setError("");
    setSuccess("");
  };

  const getImgSrc = (imagen_url) => {
    if (!imagen_url) return null;
    return imagen_url.startsWith("http") ? imagen_url : `${API_BASE}/${imagen_url.replace(/^\//, "")}`;
  };

  const imagenActual = useMemo(() => getImgSrc(formData.imagen_url), [formData.imagen_url]);

  const getStockClass = (stock) => {
    const stockNum = parseInt(stock);
    if (stockNum > 20) return "stock-alto";
    if (stockNum > 5) return "stock-medio";
    return "stock-bajo";
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  return (
    <div className={`registrar-container ${loading ? 'loading-state' : ''}`}>
      {loading && <div className="loading-overlay"><div className="loading-spinner"></div></div>}

      <h1 className="titulo">{modoEdicion ? "Editar Producto" : "Registrar Nuevo Producto"}</h1>

      {error && <div className="message message-error"><strong>Error:</strong> {error}</div>}
      {success && <div className="message message-success"><strong>Éxito:</strong> {success}</div>}

      <form className="formulario" onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre del producto *" value={formData.nombre} onChange={handleChange} required disabled={loading} maxLength={100} />
        <input type="number" step="0.01" min="0.01" name="costo" placeholder="Costo *" value={formData.costo} onChange={handleChange} required disabled={loading} />
        <input type="number" step="0.01" min="0.01" name="precio_venta" placeholder="Precio de venta *" value={formData.precio_venta} onChange={handleChange} required disabled={loading} />
        <input type="number" min="0" name="stock" placeholder="Stock *" value={formData.stock} onChange={handleChange} required disabled={loading} />

        <label className="file-label">
          Imagen del producto (opcional)
          <input type="file" name="imagen" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleChange} disabled={loading} />
        </label>

        {(preview || imagenActual) && (
          <div className="preview-zone">
            {preview ? <img className="mini-img" src={preview} alt="Vista previa" /> : imagenActual ? <img className="mini-img" src={imagenActual} alt="Imagen actual" /> : null}
          </div>
        )}

        <div className="acciones-form">
          <button type="submit" className="btn-registrar" disabled={loading}>
            {loading ? (modoEdicion ? "Actualizando..." : "Registrando...") : (modoEdicion ? "Actualizar Producto" : "Registrar Producto")}
          </button>
          {modoEdicion && <button type="button" className="btn-cancelar" onClick={handleCancelar} disabled={loading}>Cancelar</button>}
        </div>
      </form>

      {productos.filter(p => p.activo !== false).length > 0 && (
        <div className="productos-lista">
          <h2>Lista de Productos ({productos.filter(p => p.activo !== false).length})</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Costo</th>
                  <th>Precio Venta</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.filter(p => p.activo !== false).map((p) => {
                  const src = getImgSrc(p.imagen_url);
                  return (
                    <tr key={p.id_producto}>
                      <td data-label="Imagen">{src ? <img src={src} alt={p.nombre} className="mini-img" onError={(e) => { e.target.style.display = 'none'; }} /> : <span style={{fontSize: '12px', color: 'var(--text-light)'}}>Sin imagen</span>}</td>
                      <td data-label="Nombre">{p.nombre}</td>
                      <td data-label="Costo">{formatCurrency(p.costo)}</td>
                      <td data-label="Precio">{formatCurrency(p.precio_venta)}</td>
                      <td data-label="Stock"><span className={`stock-indicator ${getStockClass(p.stock)}`}>{p.stock}</span></td>
                      <td data-label="Acciones">
                        <button className="btn-editar" onClick={() => handleEditar(p)} disabled={loading} title={`Editar ${p.nombre}`}>Editar</button>
                        <button className="btn-eliminar" onClick={() => handleDesactivar(p.id_producto, p.nombre)} disabled={loading} title={`Desactivar ${p.nombre}`}>Desactivar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {productos.filter(p => p.activo !== false).length === 0 && !loading && (
        <div className="productos-lista">
          <div className="message message-warning">
            <strong>Sin productos:</strong> No hay productos activos. ¡Registra el primero!
          </div>
        </div>
      )}
    </div>
  );
}
