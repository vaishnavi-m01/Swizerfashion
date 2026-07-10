import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/apiConfig';
import { ToastAndroid } from 'react-native';


export interface WishlistItem {
    id: number | string;
    product_id: number;
    variant_id?: number;
    product?: any;
}

interface WishlistState {
    items: WishlistItem[];
    loading: boolean;
    wishlistUpdateTrigger: number;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
    wishlistUpdateTrigger: 0,
};

const pendingWishlistRequests: Map<number | string, number> = new Map();

//  Add to Wishlist 
export const addToWishlistAsync = createAsyncThunk(
    'wishlist/addToWishlistAsync',
    async (
        item: { product_id?: number; variant_id?: number; product?: any },
        { getState, dispatch }
    ) => {
        const state: any = getState();
        const isLoggedIn = state.auth.isLoggedIn;
        const userId = state.auth.userId ?? null;

        if (!isLoggedIn || !userId) {
            console.log('[Wishlist] addToWishlist aborted — user not logged in');
            return null;
        }

        const productKey = item.variant_id ?? item.product_id ?? 'wishlist';
        const now = Date.now();
        const last = pendingWishlistRequests.get(productKey);
        if (last && now - last < 1000) {
            console.log('[Wishlist] Skipping duplicate add request for:', productKey);
            return null;
        }
        pendingWishlistRequests.set(productKey, now);

        try {
            if (!item.variant_id) {
                console.log('[Wishlist] addToWishlist aborted — variant_id missing');
                return null;
            }

            const payload = {
                user_id: userId,
                variant_id: item.variant_id,
                product_id: item.product_id ?? null
            };
            console.log("WishlistPayload", payload)
            const response = await api.post('/wishlist/add', payload);
            dispatch(fetchWishlistAsync() as any);
            return response.data?.data ?? response.data ?? null;
        } catch (error: any) {
            console.log('[Wishlist] POST /wishlist/add ERROR:', error?.response?.status);
            return null;
        } finally {
            pendingWishlistRequests.delete(productKey);
        }
    }
);

export const fetchWishlistAsync = createAsyncThunk(
    'wishlist/fetchWishlistAsync',
    async (_, { getState }) => {
        const state: any = getState();
        if (!state.auth.isLoggedIn) return null;
        const userId = state.auth.userId;

        try {
            const response = await api.get(`/wishlist?user_id=${userId}`);
            const payload = response.data?.data ?? response.data ?? null;
            const items = payload?.wishlist_items ?? payload?.items ?? payload;
            return Array.isArray(items) ? items : [];
        } catch (error: any) {
            console.log('[Wishlist] GET /wishlist ERROR:', error?.response?.status);
            return [];
        }
    }
);

//Remove from Wishlist 
export const removeFromWishlistAsync = createAsyncThunk(
    'wishlist/removeFromWishlistAsync',
    async (
        { productId, wishlistItemId, variantId }: { productId: number | string; wishlistItemId?: number | string; variantId?: number | string },
        { getState, dispatch }
    ) => {
        const state: any = getState();
        const isLoggedIn = state.auth.isLoggedIn;
        const userId = state.auth.userId;
        if (!isLoggedIn || !userId || !variantId) return null;

        try {
            await api.delete('/wishlist/remove', {
                data: {
                    variant_id: variantId,
                    product_id: productId,
                },
            });
            ToastAndroid.show(
                'Wishlist removed successfully',
                ToastAndroid.SHORT,
            );
            dispatch(fetchWishlistAsync() as any);
            return { productId, wishlistItemId, variantId };
        } catch (error: any) {
            console.log('[Wishlist] POST /wishlist/remove ERROR:', error?.response?.status);
            return null;
        }
    }
);


export const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        // ── Fetch ──
        builder
            .addCase(fetchWishlistAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.items = action.payload.map((item: any) => ({
                        id: item.id ?? item.wishlist_item_id,
                        product_id: item.product_id,
                        variant_id: item.variant_id,
                        product: item.product ?? item,
                        product_varient: item.product_varient ?? null,
                    }));
                } else {
                    state.items = [];
                }
            })
            .addCase(fetchWishlistAsync.rejected, (state) => {
                state.loading = false;
            });

        // ── Add ── (update in-memory list so heart icon reflects immediately)
        builder
            .addCase(addToWishlistAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(addToWishlistAsync.fulfilled, (state) => {
                state.loading = false;
                state.wishlistUpdateTrigger += 1;
            })
            .addCase(addToWishlistAsync.rejected, (state) => {
                state.loading = false;
            });

        // ── Remove ── (update in-memory list so heart icon reflects immediately)
        builder
            .addCase(removeFromWishlistAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeFromWishlistAsync.fulfilled, (state) => {
                state.loading = false;
                state.wishlistUpdateTrigger += 1;
            })
            .addCase(removeFromWishlistAsync.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
