import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    mobile: string;
    role: string;
    is_verified: boolean;
}

interface AuthState {
    isLoggedIn: boolean;
    token: string | null;
    tokenType: string | null;
    userId: number | null;
    user: AuthUser | null;
}

const initialState: AuthState = {
    isLoggedIn: false,
    token: null,
    tokenType: null,
    userId: null,
    user: null,
};

export interface LoginPayload {
    token: string;
    tokenType: string;
    userId: number | null;
    user: AuthUser | null;
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<LoginPayload>) => {
            // Clear existing session first, then store fresh login data
            state.isLoggedIn = false;
            state.token = null;
            state.tokenType = null;
            state.userId = null;
            state.user = null;

            // Store new login response
            state.isLoggedIn = true;
            state.token = action.payload.token;
            state.tokenType = action.payload.tokenType;
            state.userId = action.payload.userId;
            state.user = action.payload.user;

            console.log('[AuthSlice] New session stored for userId:', action.payload.userId);
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.token = null;
            state.tokenType = null;
            state.userId = null;
            state.user = null;
            console.log('[AuthSlice] Session cleared on logout');
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
