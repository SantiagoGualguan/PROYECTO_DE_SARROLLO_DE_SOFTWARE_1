import apiClient from './axios';

export const AuthService = {
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  register: (data) => apiClient.post('/auth/register/', data),
  recoverPassword: (email) => apiClient.post('/auth/recover-password/', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password/', data),
};

