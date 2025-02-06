import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignInData {
    email: string;
    password: string;
}

interface ApiResponse {
    status: string;
    message: string;
    data?: {
        user: any;
        token: string;
    };
}

const API_BASE_URL = 'https://nodebackend.salmontree-886fdcec.westus2.azurecontainerapps.io';

export const loginUser = async ({ email, password }: SignInData): Promise<ApiResponse> => {
    console.log('Starting login process for email:', email);
    const apiUrl = `${API_BASE_URL}/api/auth/login`;
    
    try {
        console.log('Making login request to:', apiUrl);
        
        const response = await axios({
            method: 'post',
            url: apiUrl,
            data: { email, password },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000, // 15 second timeout
            validateStatus: (status) => status < 500 // Handle all responses below 500
        });

        console.log('Login response status:', response.status);
        console.log('Login response data:', JSON.stringify(response.data, null, 2));

        if (response.status === 200 || response.status === 201) {
            console.log('Login successful, processing user data');
            
            try {
                // Store authentication data
                if (response.data.data?.token) {
                    await AsyncStorage.setItem('authToken', response.data.data.token);
                    console.log('Auth token stored successfully');
                }

                if (response.data.data?.user) {
                    await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
                    console.log('User data stored successfully');
                }

                return {
                    status: 'success',
                    message: 'Login successful',
                    data: response.data.data
                };
            } catch (storageError) {
                console.error('Error storing auth data:', storageError);
                throw new Error('Failed to store authentication data');
            }
        }

        // Handle non-success responses
        console.warn('Login failed with status:', response.status);
        return {
            status: 'error',
            message: response.data.message || 'Login failed'
        };

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Login Error Details:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status
            });

            // Handle specific error cases
            if (error.code === 'ECONNABORTED') {
                return {
                    status: 'error',
                    message: 'Login request timed out. Please check your internet connection.'
                };
            }

            if (!error.response) {
                return {
                    status: 'error',
                    message: 'Unable to reach the server. Please check your connection.'
                };
            }

            // Handle specific HTTP status codes
            switch (error.response.status) {
                case 400:
                    return {
                        status: 'error',
                        message: 'Invalid email or password format'
                    };
                case 401:
                    return {
                        status: 'error',
                        message: 'Invalid credentials. Please check your email and password.'
                    };
                case 404:
                    return {
                        status: 'error',
                        message: 'Account not found. Please check your email.'
                    };
                case 429:
                    return {
                        status: 'error',
                        message: 'Too many login attempts. Please try again later.'
                    };
                default:
                    return {
                        status: 'error',
                        message: error.response.data.message || 'Login failed. Please try again.'
                    };
            }
        }

        // Handle non-Axios errors
        console.error('Unexpected login error:', error);
        return {
            status: 'error',
            message: 'An unexpected error occurred. Please try again.'
        };
    }
};

// Utility function to check if user is logged in
export const checkAuthStatus = async (): Promise<boolean> => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('userData');
        return !!(token && userData);
    } catch (error) {
        console.error('Error checking auth status:', error);
        return false;
    }
};

// Utility function to get user data
export const getUserData = async () => {
    try {
        const userData = await AsyncStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// Utility function to logout
export const logoutUser = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove(['authToken', 'userData']);
        console.log('Logout successful - Auth data cleared');
    } catch (error) {
        console.error('Error during logout:', error);
        throw new Error('Failed to logout properly');
    }
};