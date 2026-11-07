import axios, {
    AxiosError,
    type InternalAxiosRequestConfig
} from "axios";
import { tokenStore } from "./token-store";

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
export const api = axios.create({
    baseURL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
});

const refreshClient = axios.create({
    baseURL,
    timeout: 15000,
    withCredentials: true,
});

interface RetryConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

let authGeneration = 0;

export function invalidateAuthSession() {
    authGeneration += 1;
    tokenStore.clear();
}

function refreshAccessToken(): Promise<string> {
    if (!refreshPromise) {
        const generation = authGeneration;

        const promise = refreshClient.post<{ accessToken: string }>('/auth/refresh').then((res) => {
            if (generation !== authGeneration) {
                throw new Error('Authentication session changed');
            }

            const token = res.data.accessToken;
            tokenStore.set(token);

            return token;
        }).catch((error: unknown) => {
            if (generation === authGeneration) {
                tokenStore.clear();
            }
            throw error;
        }).finally(() => {
            if (refreshPromise === promise) {
                refreshPromise = null;
            }
        });
        refreshPromise = promise;
    }

    return refreshPromise;
}

export function restoreAccessToken() {
    return refreshAccessToken();
}

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStore.get();

        if (token) {
            config.headers.set(
                'Authorization',
                `Bearer ${token}`,
            );
        }

        return config;
    },
    (error: unknown) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as | RetryConfig | undefined;

        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        const url = originalRequest.url ?? '';

        if (
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/refresh') ||
            url.includes('/auth/logout')
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const generation = authGeneration;

        try {
            const newToken = await refreshAccessToken();

            if(generation !== authGeneration){
                return Promise.reject(error);
            }

            originalRequest.headers.set(
                'Authorization',
                `Bearer ${newToken}`,
            );

            return api(originalRequest);
        } catch {
            return Promise.reject(error)
        }
    },
);

export default api;

