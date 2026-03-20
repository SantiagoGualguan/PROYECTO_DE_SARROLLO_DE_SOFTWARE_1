import axios from 'axios';

// TODO: configurar instancia Axios con baseURL desde VITE_API_URL
// TODO: interceptor request → añadir Authorization: Bearer <token> desde localStorage
// TODO: interceptor response → si 401, intentar refresh token

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
});

export default apiClient;

