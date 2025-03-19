/**
 * Authentication context constants and types
 */

export const  AUTH_TOKEN_KEY = 'authToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const  USER_DATA_KEY = 'userData';
export const TOKEN_EXPIRY_KEY = 'tokenExpiry';


export interface AuthContextType {
    isAuthenticated : boolean;
    user : any | null;
    login: (email: string, password: string) => Promise<AuthResponse>;
    logout : () => Promise<void>;
    isLoading: boolean;
    isTokenRefreshing: boolean;
}

export interface  AuthResponse {
    success : boolean;
    message? : string;
    requiresVerification?: boolean;
}