import apiClient from "./axios";

export const DashboardService = {
  // GET /api/dashboard/admin/ - requires admin or director role
  // WARNING: on DB error this still returns 200 with empty/zeroed data
  // plus a "detail" message - check response.data.detail even on success,
  // don't rely on catch() alone to detect failures
  getAdminDashboard: () => apiClient.get('/dashboard/admin/'),

  // GET /api/dashboard/profesor/ - requires profesor role
  // Returns 404 if the authenticated user has no linked Profesor profile
  // Same 200-with-empty-data-on-DB-error caveat as above
  getProfesorDashboard: () => apiClient.get('/dashboard/profesor/'),

  // GET /api/dashboard/cliente/ - requires client role
  // Same 200-with-empty-data-on-DB-error caveat as above
  getClienteDashboard: () => apiClient.get('/dashboard/cliente/'),
};
