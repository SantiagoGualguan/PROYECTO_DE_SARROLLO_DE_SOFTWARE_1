import apiClient from "./axios";

// TODO: implementar servicios para usuarios internos y clientes

export const UserService = {
  // Endpoint: GET /api/users/internal/
  getInternalUsers: (rol, search) => {
    const params = {};
    if (rol) params.rol = rol;
    if (search) params.search = search;
    return apiClient.get("/users/internal/", { params });
  },
  // Endpoint: POST /api/users/internal/
  createInternalUser: (userData) =>
    apiClient.post("/users/internal/", userData),
  // Endpoint: GET /api/users/internal/{id}/
  getInternalUserDetail: (userId) =>
    apiClient.get(`/users/internal/${userId}/`),
  // Endpoint: PUT /api/users/internal/{id}/
  updateInternalUser: (userId, userData) =>
    apiClient.patch(`/users/internal/${userId}/`, userData), //cambie put a patch para que solo se actualicen los campos que se envien

  // Endpoint: DELETE /api/users/internal/{id}/
  deleteInternalUser: (userId) =>
    apiClient.delete(`/users/internal/${userId}/`),
  // Endpoint: GET /api/users/clients/me/
  getClientProfile: () => apiClient.get("/users/clients/me/"),
  // Endpoint: PUT /api/users/clients/me/
  updateClientProfile: (profileData) =>
    apiClient.put("/users/clients/me/", profileData),
  // Endpoint: GET /api/users/clients/me/history/
  getClientPurchaseHistory: () => apiClient.get("/users/clients/me/history/"),
};
