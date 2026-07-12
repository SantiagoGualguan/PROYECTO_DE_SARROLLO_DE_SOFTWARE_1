import apiClient from './axios';

export const CartService = {
  // GET /api/cart/ - active cart with items + choreography preloaded
  // Returns 404 if user has no active cart - handle that as "empty cart", not an error
  getActiveCart: () => apiClient.get('/cart/'),

  // POST /api/cart/items/ - adds a choreography to the active cart (creates cart if needed)
  // Can return 400 even without a real SQL error (defensive check on the backend
  // since the add_to_cart() stored procedure swallows some internal errors) -
  // show the returned "detail" message as-is to the user in that case
  addItem: (coreographyId) =>
    apiClient.post('/cart/items/', { coreography_id: coreographyId }),

  // DELETE /api/cart/items/{cartItemId}/ - removes a single item from the cart
  // Only works if the item belongs to the authenticated user's active cart (404 otherwise)
  removeItem: (cartItemId) =>
    apiClient.delete(`/cart/items/${cartItemId}/`),

  // DELETE /api/cart/ - empties the active cart (deletes all its items, cart itself stays)
  // Returns 204 on success, 404 if there's no active cart
  clearCart: () => apiClient.delete('/cart/'),
};
