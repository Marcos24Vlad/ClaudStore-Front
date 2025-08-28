import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center flex-wrap">
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-blue-600">☁️ ClaudStore</span>
      </div>
      {/* Botón móvil */}
      <button
        className="block md:hidden text-gray-700 font-bold"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        ☰
      </button>

      <div
        className={`w-full md:w-auto flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 md:mt-0 ${
          menuAbierto ? "flex" : "hidden"
        }`}
      >
        <Link
          to="/productos"
          className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Productos
        </Link>
        <Link
          to="/registrar"
          className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"
        >
          Registrar
        </Link>
        <Link
          to="/reportes"
          className="px-4 py-2 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition"
        >
          Reportes
        </Link>
      </div>
    </nav>
  );
}
