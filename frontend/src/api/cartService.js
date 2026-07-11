import apiClient from './axios';

export const CartService = {
  getActiveCart: () => apiClient.get('/cart/'),

  addItem: (coreographyId) =>
    apiClient.post('/cart/items/', { coreography_id: coreographyId }),

  removeItem: (cartItemId) =>
    apiClient.delete(`/cart/items/${cartItemId}/`),

  clearCart: () => apiClient.delete('/cart/'),
};

export const SalesService = {
  createPurchase: (data) => apiClient.post('/sales/', data),

  getPurchaseHistory: () => apiClient.get('/sales/'),

  getPurchaseDetail: (id) => apiClient.get(`/sales/${id}/`),
};
