import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Componentes
import ListaProductos from "./components/ListaProductos";
import RegistrarProductos from "./components/Registrar";
import Reportes from "./components/Reportes";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<ListaProductos />} />

        {/* Productos */}
        <Route path="/productos" element={<ListaProductos />} />

        {/* Registrar */}
        <Route path="/registrar" element={<RegistrarProductos />} />

        {/* Reportes */}
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </Router>
  );
}

export default App;
