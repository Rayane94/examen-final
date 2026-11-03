import axios from 'axios';
export const api = axios.create({ baseURL: '/api', withCredentials: true, timeout: 10000 });
export const fetchProducts = () => api.get('/products');
export const createOrder = orderData => api.post('/orders', {
  ...orderData,
  items: orderData.items.map(({ productId, quantity }) => ({ productId, quantity })),
});
