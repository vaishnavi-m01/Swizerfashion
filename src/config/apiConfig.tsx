import axios from 'axios';
import { Alert } from 'react-native';
import { BASE_URL } from '../api/apiBaseUrl';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { clearAuthState } from '../utils/storage';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

//  Public routes — NO token needed 
// Products, categories, sliders, home feeds are open to all users.
const PUBLIC_ROUTES = [
  '/categories',
  '/sliders',
  '/products',
  '/new-arrivals',
  '/best-selling',
  '/login',
  '/register',
];

const isPublicRoute = (url: string = ''): boolean => {
  return PUBLIC_ROUTES.some(route => url.startsWith(route));
};

// Kept for backward compatibility — token is now read from Redux store
// in the interceptor, so calling this is no longer required.
export const setAuthToken = (_token: string | null) => {};

// ─── Request Interceptor
// Reads the token fresh from Redux store on every request so it's always
// up-to-date after login / logout without needing to call setAuthToken().
api.interceptors.request.use(
  config => {
    const url = config.url ?? '';
    const isPublic = isPublicRoute(url);

    if (isPublic) {
      // Public route — strip any token
      delete config.headers['Authorization'];
      console.log(`[API] ${config.method?.toUpperCase()} ${url} → Public (no token)`);
    } else {
      // Protected route — attach token from Redux store
      const state = store.getState() as any;
      const token = state?.auth?.token ?? null;

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log(`[API] ${config.method?.toUpperCase()} ${url} → Token attached ✓`);
      } else {
        console.log(`[API] ${config.method?.toUpperCase()} ${url} → ⚠️ Protected route but NO token!`);
      }
    }

    if (config.data) {
      console.log('[API] Body:', JSON.stringify(config.data, null, 2));
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response Interceptor 
api.interceptors.response.use(
  response => response,

  error => {
    const status = error?.response?.status;
    const data   = error?.response?.data;

    // Extract exact server message 
    // Priority: data.message → data.error → data.errors (422) → fallback
    const getServerMessage = (): string => {
      if (data?.message) return data.message;
      if (data?.error)   return data.error;
      if (data?.errors) {
        // Validation errors: { field: ['msg1', 'msg2'] }
        const msgs = Object.values(data.errors)
          .flat()
          .filter(Boolean)
          .join('\n');
        if (msgs) return msgs;
      }
      return error?.message || 'Something went wrong';
    };

    const serverMsg = getServerMessage();

    console.log(`[API] ❌ ${status} Error:`, serverMsg);

    switch (status) {
      case 200:
      case 201:
        break;

      case 400:
        Alert.alert('Bad Request (400)', serverMsg);
        break;

      case 401:
        console.log('=== 401 SESSION EXPIRED ===');
        console.log('URL     :', error?.config?.baseURL + error?.config?.url);
        console.log('Method  :', error?.config?.method?.toUpperCase());
        console.log('Sent Authorization:', error?.config?.headers?.['Authorization'] ?? 'NOT SENT ❌');
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('===========================');

        // Alert.alert('Session Expired (401)', serverMsg);

        try {
          store.dispatch(logout());
          clearAuthState();
          console.log('[API] Cleared local auth after 401');
        } catch (e) {
          console.warn('[API] Failed to clear auth after 401', e);
        }
        break;

      case 403:
        Alert.alert('Access Denied (403)', serverMsg);
        break;

      case 404:
        Alert.alert('Not Found (404)', serverMsg);
        break;

      case 422:
        Alert.alert('Validation Error (422)', serverMsg);
        break;

      case 500:
        Alert.alert('Server Error (500)', serverMsg);
        break;

      default:
        Alert.alert(
          `Error (${status ?? 'Unknown'})`,
          serverMsg,
        );
    }

    return Promise.reject(error);
  },
);

export default api;