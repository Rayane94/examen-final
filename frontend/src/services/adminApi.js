import { api } from './api';
export const getOrders = () => api.get('/orders');
export const getProducts = () => api.get('/products');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const validateOrder = id => api.put(`/orders/${id}/validate`);
export const updateProductStock = (id, stock) => api.put(`/products/${id}/stock`, { stock: Number(stock) });
