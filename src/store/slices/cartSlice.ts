import { createSlice, PayloadAction } from '@reduxjs/toolkit';



interface CartState {
  cartCount: number;
}

const initialState: CartState = {
  cartCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartCount: (state, action: PayloadAction<number>) => {
      state.cartCount = action.payload;
    },
    clearCartCount: (state) => {
      state.cartCount = 0;
    },
  },
});

export const { setCartCount, clearCartCount } = cartSlice.actions;
export default cartSlice.reducer;