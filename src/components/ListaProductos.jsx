import React, { useEffect, useState, useRef } from "react";
import {
  Menu,
  X,
  Package,
  BarChart3,
  Plus,
  Store,
  Zap,
  Crown,
  Search,
  Filter,
  AlertTriangle,
} from "lucide-react";
import "../css/ListaProductos.css";

// 🔹 Importa tus nuevas vistas
import RegistrarProductos from "../components/Registrar";
import Reportes from "../components/Reportes";
import { API_BASE } from "../config/apiBase";



export default function ClaudStoreApp() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendiendo, setVendiendo] = useState({});
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("productos");

  // Estados para búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroStock, setFiltroStock] = useState("todos"); // todos, bajo, agotado
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Ref para controlar las actualizaciones automáticas
  const ultimaActualizacion = useRef(Date.now());
  const tiempoEsperaMinimo = 1000; // 1 segundo mínimo entre actualizaciones

// 🔹 Imágenes
const getImgSrc = (imagen_url) => {
  if (!imagen_url) return null;
  return imagen_url.startsWith("http")
    ? imagen_url
    : `${API_BASE}/${imagen_url.replace(/^\//, "")}`;
};

  useEffect(() => {
    cargarProductos();
  }, []);

  // 🔹 Efecto para actualizar automáticamente cuando se cambia a la sección productos
  useEffect(() => {
    if (seccionActiva === "productos") {
      const tiempoActual = Date.now();
      const tiempoTranscurrido = tiempoActual - ultimaActualizacion.current;

      // Solo actualizar si ha pasado el tiempo mínimo (evita actualizaciones excesivas)
      if (tiempoTranscurrido > tiempoEsperaMinimo) {
        cargarProductosSilencioso();
        ultimaActualizacion.current = tiempoActual;
      }
    }
  }, [seccionActiva]);

  // Efecto para filtrar productos
  useEffect(() => {
    let productosFiltrados = productos;

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      productosFiltrados = productosFiltrados.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por stock
    if (filtroStock === "bajo") {
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto.stock > 0 && producto.stock <= 5
      );
    } else if (filtroStock === "agotado") {
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto.stock === 0
      );
    }

    setProductosFiltrados(productosFiltrados);
  }, [productos, busqueda, filtroStock]);


// 🔹 Cargar productos
const cargarProductos = () => {
  setLoading(true);
  fetch(`${API_BASE}/productos`)
    .then((res) => res.json())
    .then((data) => {
      setProductos(data);
      setProductosFiltrados(data);
      setLoading(false);
      ultimaActualizacion.current = Date.now();
    })
    .catch((err) => {
      console.error("Error al cargar productos:", err);
      setLoading(false);
    });
};


  // 🔹 Función para carga silenciosa (sin mostrar loading)
  const cargarProductosSilencioso = () => {
    fetch(`${API_BASE}/productos`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        // No cambiamos el estado de loading para que la actualización sea invisible
        ultimaActualizacion.current = Date.now();
      })
      .catch((err) => {
        console.error("Error al cargar productos silenciosamente:", err);
      });
  };

  const venderProducto = async (producto) => {
    if (producto.stock <= 0) {
      alert("No hay stock disponible para este producto");
      return;
    }

    setVendiendo((prev) => ({ ...prev, [producto.id_producto]: true }));

    try {
      const ventaResponse = await fetch(`${API_BASE}/ventas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_producto: producto.id_producto,
          cantidad: 1,
        }),
      });

      if (!ventaResponse.ok) {
        throw new Error(
          `Error ${ventaResponse.status}: ${ventaResponse.statusText}`
        );
      }

      await ventaResponse.json();
      // 🔹 Actualizar de forma silenciosa después de una venta
      await cargarProductosSilencioso();

      alert("¡Venta registrada exitosamente!");
    } catch (error) {
      console.error("Error al registrar venta:", error);
      alert(`Error al registrar la venta: ${error.message}`);
    } finally {
      setVendiendo((prev) => ({ ...prev, [producto.id_producto]: false }));
    }
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cambiarSeccion = (seccion) => {
    setSeccionActiva(seccion);
    setMenuAbierto(false);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroStock("todos");
  };

  // 🔹 Renderiza el contenido dependiendo de la sección activa
  const renderContenido = () => {
    switch (seccionActiva) {
      case "productos":
        return renderProductos();
      case "registrar":
        return (
          <RegistrarProductos
            onProductoRegistrado={cargarProductosSilencioso}
          />
        );
      case "reportes":
        return <Reportes />;
      default:
        return renderProductos();
    }
  };

  const renderProductos = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      );
    }

    return (
      <div className="productos-section">
        {/* Filtros móviles */}
        <div className="filtros-mobile">
          {mostrarFiltros && (
            <div className="filtros-dropdown">
              <div className="filtro-grupo">
                <label>Filtrar por stock:</label>
                <select
                  value={filtroStock}
                  onChange={(e) => setFiltroStock(e.target.value)}
                  className="filtro-select"
                >
                  <option value="todos">Todos los productos</option>
                  <option value="bajo">Stock bajo</option>
                  <option value="agotado">Sin stock</option>
                </select>
              </div>
              <button onClick={limpiarFiltros} className="btn-limpiar">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="resultados-header">
          <h2>Productos ({productosFiltrados.length})</h2>
          {(busqueda || filtroStock !== "todos") && (
            <button onClick={limpiarFiltros} className="btn-limpiar-desktop">
              Limpiar filtros
            </button>
          )}
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="no-resultados">
            <Package size={48} />
            <h3>No se encontraron productos</h3>
            <p>Intenta cambiar los filtros de búsqueda</p>
            <button onClick={limpiarFiltros} className="btn-limpiar">
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="contenedor-productos">
            {productosFiltrados.map((producto) => (
              <div key={producto.id_producto} className="tarjeta-producto">
                <div className="imagen-contenedor">
                  <img
                    src={getImgSrc(producto.imagen_url)}
                    alt={producto.nombre}
                    className="imagen-producto"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="imagen-placeholder"
                    style={{ display: "none" }}
                  >
                    <Package size={40} />
                  </div>

                  {producto.stock > 0 && producto.stock <= 3 && (
                    <div className="badge-stock-bajo">
                      <AlertTriangle size={12} />
                      Stock Bajo
                    </div>
                  )}
                  {producto.stock === 0 && (
                    <div className="badge-agotado">Sin Stock</div>
                  )}
                </div>

                <div className="contenido-producto">
                  <h3 className="nombre-producto">{producto.nombre}</h3>

                  <div className="info-producto desktop-info">
                    <p>
                      <strong>Costo:</strong> ${producto.costo}
                    </p>
                    <p className="precio-producto">${producto.precio_venta}</p>
                    <div
                      className={`stock ${
                        producto.stock > 0
                          ? "stock-disponible"
                          : "stock-agotado"
                      }`}
                    >
                      Stock: {producto.stock}
                    </div>
                  </div>

                  {/* Info móvil compacta */}
                  <div className="info-mobile">
                    <div className="precio-stock-mobile">
                      <span className="precio-mobile">
                        ${producto.precio_venta}
                      </span>
                      <span
                        className={`stock-mobile ${
                          producto.stock > 0 ? "disponible" : "agotado"
                        }`}
                      >
                        Stock: {producto.stock}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => venderProducto(producto)}
                    disabled={
                      producto.stock <= 0 || vendiendo[producto.id_producto]
                    }
                    className={`btn-vender ${
                      producto.stock <= 0 ? "btn-disabled" : ""
                    }`}
                  >
                    {vendiendo[producto.id_producto]
                      ? "Vendiendo..."
                      : producto.stock <= 0
                      ? "Sin Stock"
                      : `Vender ($${producto.precio_venta})`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Logo espectacular con múltiples elementos
  const LogoEspectacular = () => (
    <div className="logo-espectacular">
      <div className="logo-container">
        <div className="logo-background">
          <div className="logo-gradient-1"></div>
          <div className="logo-gradient-2"></div>
          <div className="logo-gradient-3"></div>
        </div>

        <div className="logo-icons">
          <Store className="logo-icon-main" size={28} />
          <Zap className="logo-icon-accent-1" size={16} />
          <Crown className="logo-icon-accent-2" size={14} />
        </div>

        <div className="logo-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
        </div>
      </div>

      <div className="logo-text-container">
        <span className="logo-text-main">Claud</span>
        <span className="logo-text-accent">Store</span>
        <div className="logo-text-underline"></div>
        <div className="logo-text-glow"></div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Header con navegación */}
      <header className="header-claudstore">
        <div className="header-content">
          <LogoEspectacular />

          {/* Barra de búsqueda desktop */}
          {seccionActiva === "productos" && (
            <div className="search-desktop">
              <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filtros-desktop">
                <select
                  value={filtroStock}
                  onChange={(e) => setFiltroStock(e.target.value)}
                  className="filtro-select-desktop"
                >
                  <option value="todos">Todos</option>
                  <option value="bajo">Stock Bajo</option>
                  <option value="agotado">Sin Stock</option>
                </select>
              </div>
            </div>
          )}

          {/* Navegación Desktop */}
          <nav className="nav-desktop">
            <button
              className={`nav-item ${
                seccionActiva === "productos" ? "active" : ""
              }`}
              onClick={() => cambiarSeccion("productos")}
            >
              <Package size={20} />
              <span>Productos</span>
            </button>
            <button
              className={`nav-item ${
                seccionActiva === "registrar" ? "active" : ""
              }`}
              onClick={() => cambiarSeccion("registrar")}
            >
              <Plus size={20} />
              <span>Registrar</span>
            </button>
            <button
              className={`nav-item ${
                seccionActiva === "reportes" ? "active" : ""
              }`}
              onClick={() => cambiarSeccion("reportes")}
            >
              <BarChart3 size={20} />
              <span>Reportes</span>
            </button>
          </nav>

          {/* Controles móviles */}
          <div className="mobile-controls">
            {seccionActiva === "productos" && (
              <button
                className="btn-filtros-mobile"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter size={20} />
              </button>
            )}
            <button className="menu-toggle" onClick={toggleMenu}>
              {menuAbierto ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Búsqueda móvil */}
        {seccionActiva === "productos" && (
          <div className="search-mobile">
            <div className="search-container-mobile">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input-mobile"
              />
            </div>
          </div>
        )}

        {/* Menú móvil */}
        <div className={`nav-mobile ${menuAbierto ? "active" : ""}`}>
          <button
            className={`nav-item-mobile ${
              seccionActiva === "productos" ? "active" : ""
            }`}
            onClick={() => cambiarSeccion("productos")}
          >
            <Package size={20} />
            <span>Productos</span>
          </button>
          <button
            className={`nav-item-mobile ${
              seccionActiva === "registrar" ? "active" : ""
            }`}
            onClick={() => cambiarSeccion("registrar")}
          >
            <Plus size={20} />
            <span>Registrar Producto</span>
          </button>
          <button
            className={`nav-item-mobile ${
              seccionActiva === "reportes" ? "active" : ""
            }`}
            onClick={() => cambiarSeccion("reportes")}
          >
            <BarChart3 size={20} />
            <span>Reportes</span>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">{renderContenido()}</main>
    </div>
  );
}
