import axios from 'axios';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://apiinfrahdev.whiteflower-174c4983.westus2.azurecontainerapps.io';

interface AdminSignupData {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    is_super_admin?: boolean;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        email: string;
        status: string;
    };
    errors?: {
        msg: string;
        param: string;
    }[];
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
                    is_super_admin: true
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // If the response indicates success, return success
            if (response.data.success) {
                // Store any necessary data in AsyncStorage if needed
                if (response.data.data?.id) {
                    await setItem(JSON.stringify({
                        userId: response.data.data.id,
                        email: response.data.data.email
                    }));
                }

                return {
                    success: true,
                    message: response.data.message
                };
            }

            // If we get here, something went wrong
            return {
                success: false,
                message: response.data.message || 'Registration failed. Please try again.'
            };

        } catch (error: any) {
            console.error('Admin signup error:', error.response?.data || error);

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

            // Return the error message from the backend
            return {
                success: false,
                message: error.response?.data?.message || 'An error occurred during registration. Please try again later.',
            };
        }
    };

    return { handleAdminSignup };
};