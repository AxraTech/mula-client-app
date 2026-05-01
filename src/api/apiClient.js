import axios from 'axios';
import { BASE_URL } from '@env';
import useAuthStore from '../store/useAuthStore';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        // 1. Add Accept header (critical for many Laravel/PHP backends)
        'Accept': 'application/json', 
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        // 2. Access the token from your Auth store
        const token = useAuthStore.getState().token;
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 3. Optional: Log outgoing requests to debug that 400 error
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 4. Add a Response Interceptor to catch 400/401 errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized! User might need to log in again.");
            //useAuthStore.getState().logout();
        }
        if (error.response?.status === 400) {
            console.error("Bad Request details:", error.response.data);
        }
        return Promise.reject(error);
    }
);

export default apiClient;