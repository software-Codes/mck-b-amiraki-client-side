import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    REFRESH_TOKEN_KEY,
    AUTH_TOKEN_KEY,
    TOKEN_EXPIRY_KEY,
    USER_DATA_KEY,
} from "@/types/auth/auth-context";
import { ApiResponse, AuthTokens, UserData, SignInData } from "@/types/api/auth-api";

const API_BASE_URL =
    "https://apiinfrahdev.whiteflower-174c4983.westus2.azurecontainerapps.io/";

// Create axios instance with consistent configuration
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
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

        // Only attempt refresh for 401 errors that haven't been retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newTokens = await refreshAccessToken();
                if (newTokens) {
                    // Update the failed request with new token and retry
                    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                    return axiosInstance(originalRequest);
                } else {
                    // If we couldn't get new tokens, force logout
                    await logoutUser();
                    return Promise.reject(
                        new Error("Session expired. Please login again.")
                    );
                }
            } catch (refreshError) {
                // Handle refresh failure
                await logoutUser();
                return Promise.reject(
                    new Error("Session expired. Please login again.")
                );
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Authenticates a user with email and password
 * @param credentials User login credentials
 * @returns Authentication response with tokens and user data
 */
export const loginUser = async (
    credentials: SignInData
): Promise<ApiResponse<{ user: UserData } & AuthTokens>> => {
    try {
        const response = await axiosInstance.post("/api/auth/login", credentials);

        // Handle successful response
        if (response.data.status === "success" && response.data.data) {
            const { user, accessToken, refreshToken } = response.data.data;

            // Calculate expiry from sessionExpiry or fallback to expiresIn
            let expiryDate: string;
            if (response.data.data.sessionExpiry) {
                expiryDate = new Date(response.data.data.sessionExpiry).toISOString();
            } else if (response.data.data.expiresIn) {
                const expiresIn = response.data.data.expiresIn;
                expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString();
            } else {
                // Default to 2 hours if no expiry info provided
                expiryDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
            }

            // Sanitize user data to remove password if accidentally included
            const sanitizedUser = { ...user };
            delete sanitizedUser.password;

            // Store all auth data in AsyncStorage
            await AsyncStorage.multiSet([
                [AUTH_TOKEN_KEY, accessToken],
                [REFRESH_TOKEN_KEY, refreshToken],
                [USER_DATA_KEY, JSON.stringify(sanitizedUser)],
                [TOKEN_EXPIRY_KEY, expiryDate],
            ]);

            // Return normalized response
            return {
                status: "success",
                message: "Login successful",
                data: {
                    accessToken,
                    refreshToken,
                    expiresIn: Math.floor((new Date(expiryDate).getTime() - Date.now()) / 1000),
                    user: sanitizedUser
                },
            };
        }

        // Handle error response with consistent format
        return {
            status: "error",
            message: response.data.message || "Authentication failed",
        };
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Refreshes the access token using a stored refresh token
 * @returns New auth tokens or null if refresh fails
 */
export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
    try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) return null;

        const response = await axiosInstance.post("/api/auth/refresh-token", {
            refreshToken,
        });

        if (response.data.status === "success" && response.data.data) {
            const tokens = response.data.data;
            let expiryDate: string;

            // Calculate expiry based on available data
            if (tokens.sessionExpiry) {
                expiryDate = new Date(tokens.sessionExpiry).toISOString();
            } else if (tokens.expiresIn) {
                expiryDate = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();
            } else {
                // Default to 2 hours if no expiry info
                expiryDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
            }

            // Store new tokens
            await AsyncStorage.multiSet([
                [AUTH_TOKEN_KEY, tokens.accessToken],
                [REFRESH_TOKEN_KEY, tokens.refreshToken],
                [TOKEN_EXPIRY_KEY, expiryDate],
            ]);

            // Return normalized tokens
            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: Math.floor((new Date(expiryDate).getTime() - Date.now()) / 1000)
            };
        }

        return null;
    } catch (error) {
        console.error("Token refresh error:", error);
        await logoutUser();
        return null;
    }
};

/**
 * Checks if the current authentication is valid or needs refresh
 * @returns Auth status including validity and refresh needs
 */
export const checkAuthStatus = async (): Promise<{
    isValid: boolean;
    needsRefresh: boolean;
    timeUntilExpiry?: number;
}> => {
    try {
        const [token, refreshToken, expiry] = await Promise.all([
            AsyncStorage.getItem(AUTH_TOKEN_KEY),
            AsyncStorage.getItem(REFRESH_TOKEN_KEY),
            AsyncStorage.getItem(TOKEN_EXPIRY_KEY),
        ]);

        // No auth data
        if (!token || !refreshToken || !expiry) {
            return { isValid: false, needsRefresh: false };
        }

        const expiryTime = new Date(expiry).getTime();
        const currentTime = Date.now();
        const timeUntilExpiry = Math.floor((expiryTime - currentTime) / 1000);

        // Token is valid if not expired
        const isValidToken = expiryTime > currentTime;

        // Need refresh if expiring soon (within 5 minutes)
        const needsRefresh = isValidToken && timeUntilExpiry < 300;

        return {
            isValid: isValidToken,
            needsRefresh,
            timeUntilExpiry: isValidToken ? timeUntilExpiry : 0,
        };
    } catch (error) {
        console.error("Auth status check error:", error);
        return { isValid: false, needsRefresh: false };
    }
};

/**
 * Logs out the user by clearing all auth data
 */
export const logoutUser = async (): Promise<void> => {
    try {
        // Optional: Call logout endpoint if available
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            try {
                await axiosInstance.post("/api/auth/logout");
            } catch (logoutError) {
                // Continue with local logout even if server logout fails
                console.warn("Server logout failed:", logoutError);
            }
        }

        // Clear all auth data
        await AsyncStorage.multiRemove([
            AUTH_TOKEN_KEY,
            REFRESH_TOKEN_KEY,
            USER_DATA_KEY,
            TOKEN_EXPIRY_KEY,
        ]);
    } catch (error) {
        console.error("Logout error:", error);
    }
};

/**
 * Handles API errors with consistent response format
 * @param error Error from API call
 * @returns Standardized error response
 */
const handleApiError = (error: unknown): ApiResponse => {
    if (axios.isAxiosError(error)) {
        console.error("API Error:", {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data,
        });

        const defaultMessage = error.response?.data?.message || "An error occurred";

        if (error.code === "ECONNABORTED") {
            return {
                status: "error",
                message: "Request timed out. Please check your connection.",
            };
        }

        // Handle specific HTTP status codes
        switch (error.response?.status) {
            case 400:
                return {
                    status: "error",
                    message: error.response?.data?.message || "Invalid request"
                };
            case 401:
                return {
                    status: "error",
                    message: error.response?.data?.message || "Session expired. Please login again.",
                };
            case 403:
                return {
                    status: "error",
                    message: error.response?.data?.message || "You don't have permission for this action",
                };
            case 404:
                return {
                    status: "error",
                    message: error.response?.data?.message || "Resource not found"
                };
            case 429:
                return {
                    status: "error",
                    message: "Too many requests. Please try again later.",
                };
            case 500:
                return {
                    status: "error",
                    message: "Server error. Please try again later.",
                };
            default:
                return { status: "error", message: defaultMessage };
        }
    }

    console.error("Non-Axios error:", error);
    return { status: "error", message: "An unexpected error occurred" };
};

/**
 * Retrieves the current user data from storage
 * @returns Current user data or null
 */
export const getCurrentUser = async (): Promise<UserData | null> => {
    try {
        const userData = await AsyncStorage.getItem(USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};

/**
 * Updates stored user data (e.g., after profile update)
 * @param userData Updated user data
 */
export const updateStoredUserData = async (userData: UserData): Promise<void> => {
    try {
        // Remove password if present
        const sanitizedUser = { ...userData };
        delete sanitizedUser.password;

        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(sanitizedUser));
    } catch (error) {
        console.error("Error updating user data:", error);
    }
};