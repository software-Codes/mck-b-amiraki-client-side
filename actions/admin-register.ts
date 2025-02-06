import axios from 'axios';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE_URL = 'https://nodebackend.salmontree-886fdcec.westus2.azurecontainerapps.io';

interface AdminSignupData {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    is_super_admin?: boolean;
}

interface ApiResponse {
    status: string;
    message: string;
    data?: {
        user: any;
        token: string;
    };
    errors?: Array<{
        msg: string;
        param: string;
    }>;
}

export const useAdminSignup = () => {
    const { setItem } = useAsyncStorage('@user_token');

    const handleAdminSignup = async (formData: AdminSignupData): Promise<{
        success: boolean;
        message: string;
    }> => {
        try {
            const response = await axios.post<ApiResponse>(
                `${API_BASE_URL}/api/auth/register-admin`,
                {
                    ...formData,
                    is_super_admin: true // Default value, can be modified if needed
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status === 'success' && response.data.data?.token) {
                // Store the token
                await setItem(response.data.data.token);
                
                return {
                    success: true,
                    message: 'Registration successful! Please check your email for verification.',
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Registration failed. Please try again.',
                };
            }
        } catch (error: any) {
            console.error('Admin signup error:', error);

            // Handle validation errors
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors
                    .map((err: { msg: string }) => err.msg)
                    .join('\n');
                return {
                    success: false,
                    message: errorMessages,
                };
            }

            // Handle email/phone already exists error
            if (error.response?.data?.message?.includes('already exists')) {
                return {
                    success: false,
                    message: error.response.data.message,
                };
            }

            return {
                success: false,
                message: 'An error occurred during registration. Please try again later.',
            };
        }
    };

    return { handleAdminSignup };
};