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
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [adminData, setAdminData] = useState(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { getItem } = useAsyncStorage("@user_token");
  const { email } = useLocalSearchParams();

  const { verifyEmail, resendVerificationCode, getStoredEmail } =
    useEmailVerification();

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
    if (
      e.nativeEvent.key === "Backspace" &&
      !verificationCode[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // useEffect(() => {
  //   const fetchEmail =  async () => {
  //     const storedEmail = await getStoredEmail();
  //     if (storedEmail) {
  //      setUserEmail(storedEmail);
  //     }
  //   };
  //   fetchEmail();
  // }, []);

  const handleSubmit = async () => {
    // Get stored email from AsyncStorage
    const storedEmail = await getStoredEmail();

    if (!storedEmail) {
      Alert.alert("Error", "No email found. Please register first.");
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(storedEmail)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    // Validate verification code
    const code = verificationCode.join("");
    if (code.length !== VERIFICATION_CODE_LENGTH) {
      Alert.alert("Error", "Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmail({
        email: storedEmail, // Use the correct parameter name 'email' instead of 'userEmail'
        verificationCode: code,
      });

      if (result.success) {
        if (result.data?.role === "admin") {
          // Handle admin verification success
          Alert.alert(
            "Success",
            "Admin account verified successfully!",
            [
              {
                text: "OK",
                onPress: () => {
                  router.push("/(admin)/dashboard");
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          // Handle regular user verification success
          Alert.alert(
            "Success",
            result.message || "Email verified successfully!",
            [
              {
                text: "OK",
                onPress: () => {
                  router.push("/(root)/(tabs)/home");
                },
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        // Handle verification failure
        Alert.alert(
          "Error",
          result.message || "Verification failed. Please try again."
        );
      }
    } catch (error: any) {
      // Handle errors
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify email. Please try again.";
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
        Alert.alert("Success", result.message);
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
            Please enter the verification code sent to{"\n"}
            <Text className="font-jakartaBold text-primary-600">{email}</Text>
          </Text>

          <View className="flex-row justify-between mb-8">
            {verificationCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-12 border-2 border-blue-400 rounded-xl text-center text-xl font-jakartaBold"
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <CustomButton
            title={isLoading ? "Verifying..." : "Verify Email"}
            className="p-4 rounded-xl mb-4"
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
                  resendDisabled ? "text-gray-400" : "text-blue-500"
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
