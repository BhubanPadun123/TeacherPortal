// Local (development) backend
export let LOCAL_BACKEND = "http://192.168.1.9:8000";

// Production backend
export let PRODUCTION_BACKEND = "http://210.79.129.8";

// Export a single BACKEND_BASE_URL that selects the proper URL at runtime.
// In React Native / Expo, prefer using NODE_ENV or the __DEV__ global.
const isProduction = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') || (typeof __DEV__ !== 'undefined' && __DEV__ === false);

export const BACKEND_BASE_URL = PRODUCTION_BACKEND

export const service_path = {
    "auth": "/user/auth",
    "class": "/api/class",
    "student": "/api/student",
};