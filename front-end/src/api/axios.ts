import axios from 'axios';
import keycloak from '../auth/keycloak';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const axiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
// In your axios interceptor or API call file
axiosInstance.interceptors.request.use(async (config) => {
    console.log("=== DEBUG FRONTEND TOKEN ===");
    console.log("Keycloak authenticated:", keycloak.authenticated);
    console.log("Keycloak token exists:", !!keycloak.token);
    console.log("Keycloak token (first 50 chars):", keycloak.token ? keycloak.token.substring(0, 50) + "..." : "NO TOKEN");
    console.log("===========================");

    if (keycloak.authenticated && keycloak.token) {
        try {
            await keycloak.updateToken(30);
            config.headers.Authorization = `Bearer ${keycloak.token}`;
            console.log("Authorization header set");
        } catch (error) {
            console.error("Token refresh failed:", error);
            keycloak.login();
        }
    } else {
        console.error("NO TOKEN AVAILABLE - User not authenticated");
    }

    return config;
});
// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            // Check if Keycloak is initialized before calling login to avoid crash
            if (keycloak && keycloak.login) {
                keycloak.login();
            } else {
                console.error("401 received but Keycloak is not ready to login");
                window.location.reload(); // Fallback
            }
        } else if (status === 403) {
            window.location.href = "/unauthorized";
        }
        return Promise.reject(error);
    }
);