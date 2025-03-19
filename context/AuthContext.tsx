import { AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY, AuthResponse, AuthContextType } from "@/types/auth/auth-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, logoutUser, refreshAccessToken } from "@/actions/sign-in";
import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalContext";

// Create context with proper type specification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that manages authentication state and logic
 * @param {React.PropsWithChildren} props - Component props with children
 * @returns {React.ReactElement} Auth context provider component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Get global state from parent context
    const { isOnline, showModal } = useGlobal();

    // Authentication state management
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);

    /**
     * Initialize authentication state from persistent storage
     */
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Parallel fetch of stored authentication data
                const [storedUser, storedToken, storedRefresh, storedExpiry] = await Promise.all([
                    AsyncStorage.getItem(USER_DATA_KEY),
                    AsyncStorage.getItem(AUTH_TOKEN_KEY),
                    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
                    AsyncStorage.getItem(TOKEN_EXPIRY_KEY),
                ]);

                if (storedUser && storedToken && storedRefresh && storedExpiry) {
                    const userData = JSON.parse(storedUser);
                    const expiryDate = new Date(storedExpiry);

                    // Update UI with persisted data
                    setUser(userData);
                    setIsAuthenticated(true);

                    // Validate token freshness
                    if (new Date() < expiryDate) {
                        setIsLoading(false);
                    } else if (isOnline) {
                        // Attempt silent refresh if offline previously
                        await handleTokenRefresh();
                    }
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Auth initialization error:', error);
                await handleInvalidSession();
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [isOnline]); // Re-initialize when network status changes

    /**
     * Handle token refresh with exponential backoff retry strategy
     * @param {number} attempt - Current retry attempt number
     * @returns {Promise<void>} Refresh operation promise
     */
    const handleTokenRefresh = useCallback(async (attempt = 1) => {
        if (!isOnline) return;

        try {
            setIsTokenRefreshing(true);
            const tokens = await refreshAccessToken();

            if (!tokens) {
                throw new Error('Failed to refresh token');
            }

            // Update authentication state with new tokens
            setIsTokenRefreshing(false);
            return tokens;
        } catch (error) {
            if (attempt <= 3) {
                // Exponential backoff with jitter
                const delay = Math.min(1000 * 2 ** attempt, 30000);
                setTimeout(() => handleTokenRefresh(attempt + 1), delay);
            } else {
                // Final cleanup after failed refresh attempts
                await handleInvalidSession();
                showModal('Session expired. Please login again.');
            }
        } finally {
            setIsTokenRefreshing(false);
        }
    }, [isOnline, showModal]);

    /**
     * Clear all authentication data and reset state
     */
    const handleInvalidSession = async () => {
        await AsyncStorage.multiRemove([
            AUTH_TOKEN_KEY,
            REFRESH_TOKEN_KEY,
            USER_DATA_KEY,
            TOKEN_EXPIRY_KEY
        ]);
        setIsAuthenticated(false);
        setUser(null);
    };

    /**
     * Authentication handler with network awareness
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<AuthResponse>} Authentication result
     */
    const login = async (email: string, password: string): Promise<AuthResponse> => {
        if (!isOnline) {
            return { success: false, message: 'No internet connection' };
        }

        try {
            const response = await loginUser({ email, password });

            if (response.status !== 'success' || !response.data) {
                return {
                    success: false,
                    message: response.message || 'Authentication failed'
                };
            }

            // Update authentication state
            setUser(response.data.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error: any) {
            await handleInvalidSession();
            return {
                success: false,
                message: error.message || 'Authentication failed'
            };
        }
    };

    /**
     * Secure user logout handler
     */
    const logout = async () => {
        try {
            await logoutUser();
            await handleInvalidSession();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Provide context value with authentication state and actions
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                login,
                logout,
                isLoading,
                isTokenRefreshing
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to access authentication context
 * @returns {AuthContextType} Authentication context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};