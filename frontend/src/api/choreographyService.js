import apiClient from './axios';

// TODO: implementar servicios para catálogo de coreografías y videos

export const CoreographyService = {
  // GET /api/choreographies/ - list all choreographies, no auth required
  // Supports filters: ?genero=salsa&nivel=basico&profesor=<id>
  getAll: (params) => apiClient.get('/choreographies/', { params }),

  // GET /api/choreographies/{id}/ - no auth required
  getById: (id) => apiClient.get(`/choreographies/${id}/`),

  // POST /api/choreographies/ - requires admin, director, or profesor role
  create: (data) => apiClient.post('/choreographies/', data),

  // PUT /api/choreographies/{id}/ - requires admin, director, or profesor role
  update: (id, data) => apiClient.put(`/choreographies/${id}/`, data),

  // PATCH /api/choreographies/{id}/ - requires admin, director, or profesor role
  partialUpdate: (id, data) => apiClient.patch(`/choreographies/${id}/`, data),

  // DELETE /api/choreographies/{id}/ - requires admin, director, or profesor role
  // Soft delete: sets status to "inactive" instead of removing the row
  delete: (id) => apiClient.delete(`/choreographies/${id}/`),

  // GET /api/choreographies/top-selling/
  // NOT IMPLEMENTED YET on backend - currently throws NotImplementedError (500)
  // Don't call this from a component until it's built
  getTopSelling: () => apiClient.get('/choreographies/top-selling/'),
};

export const VideoService = {
  // GET /api/videos/?coreography={id} - no auth required
  // NOTE: verify actual route in urls.py - docstring in views.py says nested
  // (/api/choreographies/{id}/videos/) but list() filters via query param,
  // which points to a flat route instead. Adjust base path below if wrong.
  getByCoreography: (coreographyId) =>
    apiClient.get('/videos/', { params: { coreography: coreographyId } }),

  // GET /api/videos/{id}/ - no auth required
  getById: (id) => apiClient.get(`/videos/${id}/`),

  // POST /api/videos/ - requires admin, director, or profesor role
  create: (data) => apiClient.post('/videos/', data),

  // PUT /api/videos/{id}/ - requires admin, director, or profesor role
  update: (id, data) => apiClient.put(`/videos/${id}/`, data),

  // PATCH /api/videos/{id}/ - requires admin, director, or profesor role
  partialUpdate: (id, data) => apiClient.patch(`/videos/${id}/`, data),

  // DELETE /api/videos/{id}/ - requires admin, director, or profesor role
  // Hard delete - no soft-delete status field on Video
  delete: (id) => apiClient.delete(`/videos/${id}/`),
};

