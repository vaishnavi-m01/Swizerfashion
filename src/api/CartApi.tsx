import api from "../config/apiConfig";

export const addToCartApi = (data: {
  user_id?: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  size_id: number;
  color_id: number;
}) => {
  return api.post('/cart/add', data);
};

export const getCartApi = () => {
  return api.get('/cart');
};