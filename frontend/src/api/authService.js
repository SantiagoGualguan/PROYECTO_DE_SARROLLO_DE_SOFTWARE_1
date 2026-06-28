import apiClient from './axios';

// TODO: implementar funciones para login, register, logout, refresh token, recover/reset password

export const AuthService = {
  
// Endpoint: POST /api/auth/login/
login: (credentials) =>
  apiClient.post('/auth/login/', credentials),
// Endpoint: POST /api/auth/register/
register: (userData) =>
apiClient.post('/auth/register/', userData),
// Endpoint: POST /api/auth/logout/
logout: (refreshToken) =>
apiClient.post('/auth/logout/', { refresh: refreshToken }),
// Endpoint: POST /api/auth/token-refresh/
refreshToken: (refreshToken) =>
apiClient.post('/auth/token-refresh/', { refresh: refreshToken }),
// Endpoint: POST /api/auth/recover-password/
recoverPassword: (identifier, captchaToken) =>
apiClient.post('/auth/recover-password/', {
identifier,
captcha_token: captchaToken
}),
// Endpoint: POST /api/auth/reset-password/{token}/
resetPassword: (token, newPassword, captchaToken) =>
apiClient.post(`/auth/reset-password/${token}/`, {
new_password: newPassword,
captcha_token: captchaToken
})

};

