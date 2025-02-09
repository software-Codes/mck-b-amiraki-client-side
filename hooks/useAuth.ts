// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types/auth';

interface AuthResponse {
  user: User;
  token: string;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isLoading: true,
        user: null,
        token: null,
        error: null
    });

    const checkAuthStatus = async (): Promise<void> => {
        try {
            const storedToken = await AsyncStorage.getItem('userToken');
            if (!storedToken) {
                throw new Error('No token found');
            }

            const response = await fetch(
                "https://nodebackend.salmontree-886fdcec.westus2.azurecontainerapps.io/api/auth/profile",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${storedToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const userData: User = await response.json();
            
            setAuthState({
                isLoading: false,
                user: userData,
                token: storedToken,
                error: null
            });
        } catch (err) {
            setAuthState({
                isLoading: false,
                user: null,
                token: null,
                error: err instanceof Error ? err.message : 'An error occurred'
            });
            // Clear storage if token is invalid
            await AsyncStorage.removeItem('userToken');
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem('userToken');
            setAuthState({
                isLoading: false,
                user: null,
                token: null,
                error: null
            });
        } catch (err) {
            console.error('Error during logout:', err);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return {
        ...authState,
        logout,
        checkAuthStatus
    };
};