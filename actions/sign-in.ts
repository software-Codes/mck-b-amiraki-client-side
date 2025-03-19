import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {REFRESH_TOKEN_KEY, AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY,USER_DATA_KEY} from "@/types/auth/auth-context";
import {ApiResponse, AuthTokens, UserData} from "@/types/api/auth-api";





const API_BASE_URL = 'https://apiinfrahdev.whiteflower-174c4983.westus2.azurecontainerapps.io/';
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for token injection
axiosInstance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newTokens = await refreshAccessToken();
                if (newTokens) {
                    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                await logoutUser();
                return Promise.reject(new Error('Session expired. Please login again.'));
            }
        }

        return Promise.reject(error);
    }
);

export const loginUser = async (credentials: { email: string; password: string }): Promise<ApiResponse<{ user: UserData } & AuthTokens>> => {
    try {
        const response = await axiosInstance.post('/api/auth/login', credentials);

        if (response.data.status === 'success' && response.data.data) {
            const { accessToken, refreshToken, expiresIn, user } = response.data.data;
            const expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString();

            await AsyncStorage.multiSet([
                [AUTH_TOKEN_KEY, accessToken],
                [REFRESH_TOKEN_KEY, refreshToken],
                [USER_DATA_KEY, JSON.stringify(user)],
                [TOKEN_EXPIRY_KEY, expiryDate]
            ]);

            return {
                status: 'success',
                message: 'Login successful Continue to the Homepage',
                data: { accessToken, refreshToken, expiresIn, user }
            }
        }

        return {
            status: 'error',
            message: response.data.message || 'Authentication failed'
        };
    } catch (error) {
        return handleApiError(error);
    }
};

export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
    try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) return null;

        const response = await axiosInstance.post('/api/auth/refresh-token', { refreshToken });

        if (response.data.status === 'success' && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data;
            const expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString();

            await AsyncStorage.multiSet([
                [AUTH_TOKEN_KEY, accessToken],
                [REFRESH_TOKEN_KEY, newRefreshToken],
                [TOKEN_EXPIRY_KEY, expiryDate]
            ]);

            return { accessToken, refreshToken: newRefreshToken, expiresIn };
        }

        return null;
    } catch (error) {
        await logoutUser();
        return null;
    }
};

export const checkAuthStatus = async (): Promise<{ isValid: boolean; needsRefresh: boolean }> => {
    try {
        const [token, refreshToken, expiry] = await Promise.all([
            AsyncStorage.getItem(AUTH_TOKEN_KEY),
            AsyncStorage.getItem(REFRESH_TOKEN_KEY),
            AsyncStorage.getItem(TOKEN_EXPIRY_KEY)
        ]);

        if (!token || !refreshToken || !expiry) return { isValid: false, needsRefresh: false };

        const isValidToken = new Date(expiry) > new Date();
        return {
            isValid: isValidToken,
            needsRefresh: !isValidToken
        };
    } catch (error) {
        return { isValid: false, needsRefresh: false };
    }
};

export const logoutUser = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            AUTH_TOKEN_KEY,
            REFRESH_TOKEN_KEY,
            USER_DATA_KEY,
            TOKEN_EXPIRY_KEY
        ]);
    } catch (error) {
        console.error('Logout error:', error);
    }
};

const handleApiError = (error: unknown): ApiResponse => {
    if (axios.isAxiosError(error)) {
        console.error('API Error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });

        const defaultMessage = error.response?.data?.message || 'An unexpected error occurred';

        if (error.code === 'ECONNABORTED') {
            return { status: 'error', message: 'Request timed out. Please check your connection.' };
        }

        switch (error.response?.status) {
            case 400: return { status: 'error', message: 'Invalid request' };
            case 401: return { status: 'error', message: 'Session expired. Please login again.' };
            case 403: return { status: 'error', message: 'You don\'t have permission for this action' };
            case 404: return { status: 'error', message: 'Resource not found' };
            case 429: return { status: 'error', message: 'Too many requests. Please try again later.' };
            case 500: return { status: 'error', message: 'Server error. Please try again later.' };
            default: return { status: 'error', message: defaultMessage };
        }
    }

    console.error('Non-Axios error:', error);
    return { status: 'error', message: 'An unexpected error occurred' };
};