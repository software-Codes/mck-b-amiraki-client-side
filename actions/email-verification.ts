import axios from 'axios';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://nodebackend.salmontree-886fdcec.westus2.azurecontainerapps.io';

interface VerificationData {
    email: string;
    verificationCode: string;
}

interface ApiResponse {
    status: string;
    message: string;
    data?: {
        id: string;
        full_name: string;
        email: string;
        phone_number: string;
        role: string;
        status: string;
    };
    errors?: Array<{
        msg: string;
        param: string;
    }>;
}

export const useEmailVerification = () => {
    const { getItem, setItem } = useAsyncStorage('@user_token');

    const verifyEmail = async (data: VerificationData): Promise<{
        success: boolean;
        message: string;
        data?: ApiResponse['data'];
    }> => {
        try {
            const response = await axios.post<ApiResponse>(
                `${API_BASE_URL}/api/auth/verify-admin`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status === 'success') {
                // Update user status in storage if needed
                const token = await getItem();
                if (token) {
                    await setItem(token); // You might want to update the stored user data here
                }

                return {
                    success: true,
                    message: 'Email verified successfully!',
                    data: response.data.data
                };
            }

            return {
                success: false,
                message: response.data.message
            };

        } catch (error: any) {
            console.error('Email verification error:', error);

            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors
                    .map((err: { msg: string }) => err.msg)
                    .join('\n');
                return {
                    success: false,
                    message: errorMessages,
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Verification failed. Please try again.',
            };
        }
    };

    const resendVerificationCode = async (email: string): Promise<{
        success: boolean;
        message: string;
    }> => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/resend-verification`,
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                success: true,
                message: 'Verification code resent successfully!'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to resend verification code.'
            };
        }
    };

    return { verifyEmail, resendVerificationCode };
};