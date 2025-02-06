import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { icons, images } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { useEmailVerification } from "@/actions/email-verification";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_LENGTH = 6;

const EmailVerification = () => {
  const { email } = useLocalSearchParams();
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);2
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const { verifyEmail, resendVerificationCode } = useEmailVerification();

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

    // Auto-focus next input
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

  const handleSubmit = async () => {
    if (!email || !EMAIL_REGEX.test(email as string)) {
      Alert.alert("Error", "Invalid email address");
      return;
    }

    const code = verificationCode.join("");
    if (code.length !== VERIFICATION_CODE_LENGTH) {
      Alert.alert("Error", "Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmail({
        email: email as string,
        verificationCode: code,
      });

      if (result.success) {
        Alert.alert("Success", result.message, [
          {
            text: "OK",
            onPress: () => router.push("/(root)/(tabs)/home"),
          },
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to verify email. Please try again.");
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
        {/* Header Section */}
        <View className="relative w-full h-[200px]">
          <View className="absolute inset-0 bg-black/20">
            <Image
              source={images.onboarding1}
              className="w-full h-full object-cover"
              resizeMode="cover"
            />
          </View>
          <View className="absolute inset-0 flex items-center justify-end px-6 pb-6">
            <Text className="text-3xl font-jakartaBold text-primary-600">
              Email Verification
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-6 py-8">
          <Text className="text-center text-gray-600 mb-8 font-jakartaMedium">
            Please enter the verification code sent to{"\n"}
            <Text className="font-jakartaBold text-primary-600">{email}</Text>
          </Text>

          {/* Verification Code Input */}
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

          {/* Verify Button */}
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

          {/* Resend Code Section */}
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
