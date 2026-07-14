import apiClient from './axios';

// TODO: implementar servicios para ventas y checkout

export const SalesService = {
  // POST /api/sales/ - alias, delegates directly to confirm-payment
  // Same required fields as confirmPayment below
  createPurchase: (data) => apiClient.post('/sales/', data),

  // GET /api/sales/ - purchase history for the authenticated client
  getPurchaseHistory: () => apiClient.get('/sales/'),

  // GET /api/sales/{id}/ - single purchase detail, only if it belongs to the user
  getPurchaseDetail: (id) => apiClient.get(`/sales/${id}/`),

  // POST /api/sales/confirm-items/ - checkout wizard step 1
  // body: { cart_id? } - omit cart_id to use the user's current active cart
  // Validates the cart has items, computes total, stages it in the session
  confirmItems: (cartId) =>
    apiClient.post('/sales/confirm-items/', cartId ? { cart_id: cartId } : {}),

  // POST /api/sales/confirm-billing/ - checkout wizard step 2
  // body: { cart_id?, email_address, titular_name, document_number, details? }
  // email_address, titular_name, document_number are required
  confirmBilling: (billingData) =>
    apiClient.post('/sales/confirm-billing/', billingData),

  // POST /api/sales/confirm-payment/ - checkout wizard step 3, charges via Stripe
  // body: {
  //   cart_id?,                  // optional if step 1 already staged one
  //   payment_method,            // REQUIRED - Stripe payment method token (e.g. from Stripe.js), NOT raw card data
  //   bill_payment_method?,      // "pse" | "card" - how it's recorded on the Bill, defaults to "card"
  //   currency?,                 // defaults to "usd"
  //   email_address?, titular_name?, document_number?, details?  // only needed if not already staged in step 2
  // }
  // amount is NEVER sent - backend always computes it from the cart server-side
  // On failure after a successful Stripe charge, backend auto-refunds and
  // returns 500 with refund_attempted: true - surface that clearly to the user
  confirmPayment: (paymentData) =>
    apiClient.post('/sales/confirm-payment/', paymentData),
};

