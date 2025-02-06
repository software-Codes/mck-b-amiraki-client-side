import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignupData {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
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

export const memberSignup = async (userData: SignupData): Promise<ApiResponse> => {
    console.log('Starting signup process with data:', JSON.stringify(userData, null, 2));
    
    const apiUrl = `${API_BASE_URL}/api/auth/register`;
    console.log('Making API request to:', apiUrl);
    
    try {
        const response = await axios({
            method: 'post',
            url: apiUrl,
            data: userData,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000, // Increased timeout for Azure
            validateStatus: (status) => status < 500 // Handle all responses below 500
        });

        console.log('Raw API Response:', response);
        console.log('API Response Data:', JSON.stringify(response.data, null, 2));

        if (response.status === 201 || response.status === 200) {
            console.log('Signup successful, processing response');
            
            if (response.data.data?.token) {
                try {
                    await AsyncStorage.setItem('authToken', response.data.data.token);
                    await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
                    console.log('Auth data stored successfully');
                } catch (storageError) {
                    console.error('Error storing auth data:', storageError);
                    throw new Error('Failed to store authentication data');
                }
            }
            
            return {
                status: 'success',
                message: 'Registration successful',
                data: response.data.data
            };
        }

        // Handle non-success responses
        console.warn('API returned non-success status:', response.status, response.data);
        return {
            status: 'error',
            message: response.data.message || 'Registration failed'
        };

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Detailed Axios Error:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });

            // Handle specific error cases
            if (error.code === 'ECONNABORTED') {
                return {
                    status: 'error',
                    message: 'Request timed out. Please check your internet connection and try again.'
                };
            }

            if (!error.response) {
                return {
                    status: 'error',
                    message: 'Unable to reach the server. Please check your internet connection.'
                };
            }

            // Handle specific HTTP status codes
            switch (error.response.status) {
                case 400:
                    return {
                        status: 'error',
                        message: error.response.data.message || 'Invalid registration data provided'
                    };
                case 409:
                    return {
                        status: 'error',
                        message: 'This email is already registered'
                    };
                case 422:
                    return {
                        status: 'error',
                        message: 'Please check your input and try again'
                    };
                default:
                    return {
                        status: 'error',
                        message: error.response.data.message || 'Registration failed. Please try again.'
                    };
            }
        }
        
        // Handle non-Axios errors
        console.error('Non-Axios Error:', error);
        return {
            status: 'error',
            message: 'An unexpected error occurred. Please try again later.'
        };
    }
};