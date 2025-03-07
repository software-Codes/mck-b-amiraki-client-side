// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, logoutUser, checkAuthStatus as apiCheckAuthStatus } from '@/actions/sign-in';

/**
 * Constants for AsyncStorage keys to maintain consistency across the application
 * @constant {string} AUTH_TOKEN_KEY - Key for storing authentication token
 * @constant {string} USER_DATA_KEY - Key for storing serialized user data
 */
export const AUTH_TOKEN_KEY = 'authToken';
export const USER_DATA_KEY = 'userData';

/**
 * Interface defining the shape of the authentication context
 * @interface AuthContextType
 * @property {boolean} isAuthenticated - Flag indicating user authentication status
 * @property {any | null} user - User data object or null when not authenticated
 * @property {(email: string, password: string) => Promise<any>} login - User login function
 * @property {() => Promise<void>} logout - User logout function
 * @property {boolean} isLoading - Loading state for initial auth check
 */
interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

/**
 * Authentication context created with React's createContext
 * Initialized as undefined for better TypeScript support
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that manages authentication state and provides context to children
 * @component
 * @param {Object} props - React component props
 * @param {React.ReactNode} props.children - Child components to be wrapped by the provider
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State management for authentication status, user data, and loading state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Effect hook for initial authentication state check on component mount
    useEffect(() => {
        checkInitialAuthState();
    }, []);

    /**
     * Checks initial authentication state from persistent storage
     * @async
     * @function checkInitialAuthState
     * @returns {Promise<void>}
     */
    const checkInitialAuthState = async () => {
        try {
            // Retrieve stored authentication data from AsyncStorage
            const [storedToken, storedUserData] = await Promise.all([
                AsyncStorage.getItem(AUTH_TOKEN_KEY),
                AsyncStorage.getItem(USER_DATA_KEY)
            ]);

            if (storedToken && storedUserData) {
                // Immediately set user data for fast UI rendering
                const userData = JSON.parse(storedUserData);
                setUser(userData);
                setIsAuthenticated(true);

                // Validate token with backend service (optional security step)
                try {
                    const isValid = await apiCheckAuthStatus();
                    if (!isValid) {
                        await handleInvalidToken();
                    }
                } catch (validationError) {
                    console.warn('Token validation error:', validationError);
                    // Implementation decision: Maintain session on validation failure
                    // Consider adding retry logic or manual validation here
                }
            }
        } catch (error) {
            console.error('Error checking initial auth state:', error);
            await handleStorageError();
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles user login operations
     * @async
     * @function login
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<{ success: boolean, message?: string }>} Login operation result
     */
    const login = async (email: string, password: string) => {
        try {
            const response = await loginUser({ email, password });

            if (response.status === 'success' && response.data) {
                // Update state with new user data
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }

            return { success: false, message: response.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        }
    };

    /**
     * Handles user logout operations
     * @async
     * @function logout
     * @returns {Promise<void>}
     */
    const logout = async () => {
        try {
            setIsLoading(true);
            await logoutUser(); // API call that clears AsyncStorage
            resetAuthState();
        } catch (error) {
            console.error('Logout error:', error);
            throw error; // Propagate error for error boundary handling
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Resets authentication state to default values
     * @function resetAuthState
     */
    const resetAuthState = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    /**
     * Handles invalid token scenario by clearing storage and state
     * @async
     * @function handleInvalidToken
     * @returns {Promise<void>}
     */
    const handleInvalidToken = async () => {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
        resetAuthState();
    };

    /**
     * Handles storage errors by clearing potentially corrupted data
     * @async
     * @function handleStorageError
     * @returns {Promise<void>}
     */
    const handleStorageError = async () => {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
        resetAuthState();
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                login,
                logout,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook for accessing authentication context
 * @function useAuth
 * @returns {AuthContextType} Authentication context
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};