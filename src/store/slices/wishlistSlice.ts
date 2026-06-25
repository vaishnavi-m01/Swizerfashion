import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
    items: any[];
}

const initialState: WishlistState = {
    items: [],
};

export const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlist: (state, action: PayloadAction<any>) => {
            const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
            if (existingIndex >= 0) {
                state.items.splice(existingIndex, 1);
            } else {
                state.items.push(action.payload);
            }
        },
        removeFromWishlist: (state, action: PayloadAction<number | string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        clearWishlist: (state) => {
            state.items = [];
        }
    },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
