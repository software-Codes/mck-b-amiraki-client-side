export interface User {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    role: 'user' | 'admin';
    status: 'active' | 'pending';
    created_at: string;
    updated_at: string;
    last_login?: string;

}

export interface DecodedToken {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
}