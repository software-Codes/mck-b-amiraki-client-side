import axios from "axios";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  "https://apiinfrahdev.whiteflower-174c4983.westus2.azurecontainerapps.io";

interface VerificationData {
  email: string;
  verificationCode: string;
}

interface ApiResponse {
  status: 'success' | 'error';  // Updated to match backend
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
  const { getItem, setItem } = useAsyncStorage("@user_token");

  const verifyEmail = async (
    data: VerificationData
  ): Promise<{
    success: boolean;
    message: string;
    data?: ApiResponse["data"];
  }> => {
    try {
      const storedData = await getItem();
      const userData = storedData ? JSON.parse(storedData) : null;

      if (!userData || !userData.email) {
        throw new Error("No user data found. Please register first.");
      }

      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/api/auth/verify-admin`,
        {
          email: userData.email,
          verificationCode: data.verificationCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Update to handle the backend's status field
      if (response.data.status === 'success') {
        const updatedUserData = {
          ...userData,
          status: "active",
          ...response.data.data,
        };
        await setItem(JSON.stringify(updatedUserData));

        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data.message || "Verification failed",
      };
    } catch (error: any) {
      console.error("Email verification error:", error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err: { msg: string }) => err.msg)
          .join("\n");
        return {
          success: false,
          message: errorMessages,
        };
      }

      // Handle other errors
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Verification failed. Please try again.",
      };
    }
  };

  const resendVerificationCode = async (
    email: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      // Get stored user data
      const storedData = await getItem();
      const userData = storedData ? JSON.parse(storedData) : null;

      if (!userData || !userData.email) {
        throw new Error("No user data found. Please register first.");
      }

      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/api/auth/resend-verification`,
        { email: userData.email }, // Use email from stored data
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          message: "Verification code resent successfully!",
        };
      }

      return {
        success: false,
        message: response.data.message || "Failed to resend verification code",
      };
    } catch (error: any) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to resend verification code.",
      };
    }
  };

  // Add a function to get the stored email
  const getStoredEmail = async (): Promise<string | null> => {
    try {
      const storedData = await getItem();
      if (storedData) {
        const userData = JSON.parse(storedData);
        return userData.email || null;
      }
      return null;
    } catch (error) {
      console.error("Error getting stored email:", error);
      return null;
    }
  };

  return { verifyEmail, resendVerificationCode, getStoredEmail };
};
