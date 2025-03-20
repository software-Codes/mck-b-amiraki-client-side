import { AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY, AuthResponse, AuthContextType } from "@/types/auth/auth-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, logoutUser, refreshAccessToken, checkAuthStatus, getCurrentUser } from "@/actions/sign-in";
import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { UserData } from "@/types/api/auth-api";

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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isTokenRefreshing, setIsTokenRefreshing] = useState<boolean>(false);

    /**
     * Check token validity and refresh if needed
     */
    const checkAndRefreshToken = useCallback(async () => {
        try {
            const authStatus = await checkAuthStatus();

            if (!authStatus.isValid && !isTokenRefreshing) {
                // Token is invalid, try to refresh if we have refresh token
                const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
                if (refreshToken && isOnline) {
                    return await handleTokenRefresh();
                } else {
                    // No refresh token or offline
                    await handleInvalidSession();
                    return false;
                }
            } else if (authStatus.needsRefresh && isOnline && !isTokenRefreshing) {
                // Token is valid but expiring soon
                return await handleTokenRefresh();
            }

            return authStatus.isValid;
        } catch (error) {
            console.error('Token check error:', error);
            await handleInvalidSession();
            return false;
        }
    }, [isOnline, isTokenRefreshing]);

    /**
     * Initialize authentication state from persistent storage
     */
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);

                // Get user data first to update UI quickly
                const userData = await getCurrentUser();
                if (userData) {
                    setUser(userData);
                }

                // Check token validity
                const isValid = await checkAndRefreshToken();
                setIsAuthenticated(isValid);
            } catch (error) {
                console.error('Auth initialization error:', error);
                await handleInvalidSession();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [isOnline]); // Re-initialize when network status changes

    /**
     * Schedule periodic token checks when app is active
     */
    useEffect(() => {
        if (!isAuthenticated || !isOnline) return;

        // Check token every 5 minutes
        const tokenCheckInterval = setInterval(() => {
            checkAndRefreshToken();
        }, 5 * 60 * 1000);

        return () => clearInterval(tokenCheckInterval);
    }, [isAuthenticated, isOnline, checkAndRefreshToken]);

    /**
     * Handle token refresh with exponential backoff retry strategy
     * @param {number} attempt - Current retry attempt number
     * @returns {Promise<boolean>} Success state of refresh operation
     */
    const handleTokenRefresh = useCallback(async (attempt = 1): Promise<boolean> => {
        if (!isOnline || isTokenRefreshing) return false;

        try {
            setIsTokenRefreshing(true);
            const tokens = await refreshAccessToken();

            if (!tokens) {
                throw new Error('Failed to refresh token');
            }

            // Update authentication state with new tokens
            setIsAuthenticated(true);

            // Refresh user data if needed
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
            }

            return true;
        } catch (error) {
            console.error('Token refresh error:', error);

            if (attempt <= 3 && isOnline) {
                // Exponential backoff with jitter
                const delay = Math.min(1000 * (2 ** attempt) + Math.random() * 1000, 30000);

                return new Promise(resolve => {
                    setTimeout(async () => {
                        const success = await handleTokenRefresh(attempt + 1);
                        resolve(success);
                    }, delay);
                });
            } else {
                // Final cleanup after failed refresh attempts
                await handleInvalidSession();
                showModal('Session expired. Please login again.');
                return false;
            }
        } finally {
            setIsTokenRefreshing(false);
        }
    }, [isOnline, showModal, isTokenRefreshing]);

    /**
     * Clear all authentication data and reset state
     */
    const handleInvalidSession = async () => {
        await logoutUser();
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
            setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Secure user logout handler
     */
    const logout = async () => {
        setIsLoading(true);
        try {
            await logoutUser();
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
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