import apiClient from "./axios";

export const DashboardService = {
  getAdminDashboard: () => apiClient.get("/dashboard/admin/"),

  getProfesorDashboard: () => apiClient.get("/dashboard/profesor/"),

  getClienteDashboard: () => apiClient.get("/dashboard/cliente/"),
};
