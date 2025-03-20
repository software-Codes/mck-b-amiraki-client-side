
 export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message: string;
    data?: T;
}


  export interface SignInData {
     email: string;
     password: string;
 }
 export interface UserData {
     id: string;
     email: string;
     role: string;
     password?: string;
     phoneNumber: string;
     // Add other user properties as needed
 }

 export interface AuthTokens {
     accessToken: string;
     refreshToken: string;
     expiresIn: number;
 }


