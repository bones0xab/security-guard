import axios from 'axios';
import keycloak from '../auth/keycloak';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const axiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
axiosInstance.interceptors.request.use(async (config) => {
    // Only try to add token if Keycloak is actually ready and authenticated
    if (keycloak.authenticated && keycloak.token) {
        try {
            await keycloak.updateToken(30);
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        } catch (error) {
            console.error("Token refresh failed");
            keycloak.login();
        }
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