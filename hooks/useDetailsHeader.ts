import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import {User, DecodedToken, AuthState} from "@/types/Header";

class UserService {
    private static instance: UserService;
    private authState: AuthState = {
        user: null,
        token: null,
    };

    private constructor() {}

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
    // Initialize the service by checking for existing auth data
    public async initialize(): Promise<void> {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userData = await AsyncStorage.getItem('userData');

            if (token && userData) {
                this.authState = {
                    token,
                    user: JSON.parse(userData),
                };
            }
        } catch (error) {
            console.error('Error initializing UserService:', error);
        }
    }

    // Get current user's data
    public getCurrentUser(): User | null {
        return this.authState.user;
    }

    // Get user's full name
    public getUserFullName(): string {
        return this.authState.user?.full_name || '';
    }
    // Update auth state after login
    public async setAuthData(token: string, user: User): Promise<void> {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            this.authState = {
                token,
                user,
            };
        } catch (error) {
            console.error('Error setting auth data:', error);
            throw error;
        }
    }

    // Clear auth state on logout
    public async clearAuthData(): Promise<void> {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');

            this.authState = {
                token: null,
                user: null,
            };
        } catch (error) {
            console.error('Error clearing auth data:', error);
            throw error;
        }
    }

    // Check if token is valid
    public isTokenValid(): boolean {
        const token = this.authState.token;
        if (!token) return false;

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
}

export const userService = UserService.getInstance();
export type { User, AuthState };