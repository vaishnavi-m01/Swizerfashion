import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginPayload } from '../store/slices/authSlice';

const AUTH_STORAGE_KEY = 'swizerfashion_auth';

export const saveAuthState = async (authState: LoginPayload) => {
    try {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } catch (error) {
        console.warn('[Storage] saveAuthState failed:', error);
    }
};

export const loadAuthState = async (): Promise<LoginPayload | null> => {
    try {
        const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as LoginPayload;
    } catch (error) {
        console.warn('[Storage] loadAuthState failed:', error);
        return null;
    }
};

export const clearAuthState = async () => {
    try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
        console.warn('[Storage] clearAuthState failed:', error);
    }
};
