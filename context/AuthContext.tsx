// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, checkAuthStatus, getUserData, logoutUser } from '../actions/sign-in';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkInitialAuthState();
    }, []);

    const checkInitialAuthState = async () => {
        try {
            // First check AsyncStorage for existing token and user data
            const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);

            if (storedToken && storedUserData) {
                // Validate the stored token with your backend
                const isLoggedIn = await checkAuthStatus();

                if (isLoggedIn) {
                    // If token is still valid, restore the user data
                    const userData = JSON.parse(storedUserData);
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    // If token is invalid, clear storage
                    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
                }
            }
        } catch (error) {
            console.error('Error checking initial auth state:', error);
            // On error, clear storage to be safe
            await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await loginUser({ email, password });
            if (response.status === 'success' && response.data) {
                // Store auth token and user data in AsyncStorage
                await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
                await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));

                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            // Clear AsyncStorage
            await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};