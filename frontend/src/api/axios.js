import axios from 'axios';

// TODO: configurar instancia Axios con baseURL desde VITE_API_URL
// TODO: interceptor request → añadir Authorization: Bearer <token> desde localStorage
// TODO: interceptor response → si 401, intentar refresh token

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
});

// Request interceptor: attach access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401, try refreshing the token once, then retry
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {
      // Wait for the in-flight refresh to finish, then retry this request
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(config));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${apiClient.defaults.baseURL}/auth/token-refresh/`,
        { refresh: refreshToken }
      );

      localStorage.setItem('access_token', data.access);
      isRefreshing = false;
      onRefreshed(data.access);

      config.headers.Authorization = `Bearer ${data.access}`;
      return apiClient(config);
    } catch (refreshError) {
      isRefreshing = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);
export default apiClient;

