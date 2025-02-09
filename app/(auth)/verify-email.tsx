import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { useEmailVerification } from "@/actions/email-verification";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_LENGTH = 6;

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState(
    Array(VERIFICATION_CODE_LENGTH).fill("")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [adminData, setAdminData] = useState(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { getItem } = useAsyncStorage("@user_token");
  const { email } = useLocalSearchParams();

  const { verifyEmail, resendVerificationCode, getStoredEmail } = useEmailVerification();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = await getItem();
      if (token) {
        try {
          const userData = JSON.parse(token);
          setAdminData(userData);
        } catch (error) {
          console.error("Error parsing admin data:", error);
        }
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text.length === 1 && index < VERIFICATION_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const storedEmail = await getStoredEmail();

    if (!storedEmail) {
      Alert.alert("Error", "No email found. Please register first.");
      return;
    }

    if (!EMAIL_REGEX.test(storedEmail)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    const code = verificationCode.join("");
    if (code.length !== VERIFICATION_CODE_LENGTH) {
      Alert.alert("Error", "Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    setVerificationStatus('loading');

    try {
      const result = await verifyEmail({
        email: storedEmail,
        verificationCode: code,
      });

      if (result.success) {
        setVerificationStatus('success');
        Alert.alert(
          "Verification Successful",
          "Your admin account has been verified successfully. You will be redirected to the admin dashboard.",
          [
            {
              text: "Proceed to Dashboard",
              onPress: () => {
                router.push("/(admin)/dashboard");
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        setVerificationStatus('error');
        Alert.alert("Verification Failed", result.message);
      }
    } catch (error: any) {
      setVerificationStatus('error');
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Verification failed. Please check your code and try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendDisabled) return;

    setIsLoading(true);
    try {
      const result = await resendVerificationCode(email as string);
      if (result.success) {
        setCountdown(60);
        setResendDisabled(true);
        Alert.alert(
          "Code Resent",
          "A new verification code has been sent to your email address."
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        <View className="relative w-full h-[200px]">
          <View className="absolute inset-0 bg-black/20">
            <Image
              source={images.onboarding1}
              className="w-full h-full object-cover"
              resizeMode="cover"
            />
          </View>
          <View className="absolute inset-0 flex items-center justify-end px-12">
            <Text className="text-3xl font-jakartaBold text-primary-600">
              Admin Verification
            </Text>
          </View>
        </View>

        <View className="px-6 py-8">
          <Text className="text-center text-gray-600 mb-8 font-jakartaMedium">
            Please enter the verification code sent to {"\n"}
            <Text className="font-jakartaBold text-primary-600">your email address</Text>
          </Text>

          <View className="flex-row justify-between mb-8">
            {verificationCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={`w-12 h-12 border-2 ${
                  verificationStatus === 'success' 
                    ? 'border-green-400' 
                    : verificationStatus === 'error'
                    ? 'border-red-400'
                    : 'border-blue-400'
                } rounded-xl text-center text-xl font-jakartaBold`}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!isLoading}
              />
            ))}
          </View>

          {verificationStatus === 'loading' && (
            <View className="items-center mb-4">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="text-gray-600 mt-2 font-jakartaMedium">
                Verifying your admin account...
              </Text>
            </View>
          )}

          <CustomButton
            title={isLoading ? "Verifying..." : "Verify Email"}
            className={`p-4 rounded-xl mb-4 ${
              verificationStatus === 'loading' ? 'opacity-70' : 'opacity-100'
            }`}
            bgVariant="primary"
            disabled={
              isLoading ||
              verificationCode.join("").length !== VERIFICATION_CODE_LENGTH
            }
            onPress={handleSubmit}
          />

          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-600 font-jakartaMedium">
              Didn't receive the code?{" "}
            </Text>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={resendDisabled || isLoading}
            >
              <Text
                className={`font-jakartaBold ${
                  resendDisabled || isLoading ? "text-gray-400" : "text-blue-500"
                }`}
              >
                {resendDisabled ? `Resend in ${countdown}s` : "Resend Code"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EmailVerification;