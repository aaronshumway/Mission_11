// Site origin only (no /api/...). Code adds paths like /api/books. For production builds,
// set VITE_API_BASE (see .env.production) to your Azure App Service URL.
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5250'
