export const API_BASE =
  import.meta?.env?.VITE_API_BASE ||   // Para Vite
  process.env.REACT_APP_API_BASE ||    // Para Create React App
  "http://localhost:8000";             // Fallback para desarrollo
    