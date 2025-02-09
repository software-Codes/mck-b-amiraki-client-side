// types/auth.ts
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    // Add other user properties as needed
  }
  
  export interface AuthState {
    isLoading: boolean;
    user: User | null;
    token: string | null;
    error: string | null;
  }