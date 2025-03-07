import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { useState, useMemo, useEffect } from "react";
import {useAuth} from '@/context/AuthContext';
interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const SignIn = () => {
  const { login, isAuthenticated, user } = useAuth(); // Use the auth context
  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "admin") {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/(root)/(tabs)/home");
      }
    }
  }, [isAuthenticated, user]);

  const validateField = (fieldName: keyof FormData, value: string) => {
    let error = "";

    if (!value.trim()) {
      error = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    } else {
      switch (fieldName) {
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Please enter a valid email address";
          }
          break;
        case "password":
          if (value.length < 6) {
            error = "Password must be at least 6 characters long";
          }
          break;
      }
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const handleBlur = (fieldName: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, form[fieldName]);
  };

  const handleChange = (fieldName: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [fieldName]: value }));
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  };

  const isFormValid = useMemo(() => {
    const allFieldsFilled = Object.values(form).every(
        (value) => value.trim() !== ""
    );
    const noErrors = Object.values(errors).every((error) => !error);
    return allFieldsFilled && noErrors;
  }, [form, errors]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const allTouched = Object.keys(form).reduce(
          (acc, key) => ({
            ...acc,
            [key]: true,
          }),
          {}
      );
      setTouched(allTouched as Record<keyof FormData, boolean>);

      const newErrors = Object.entries(form).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: validateField(key as keyof FormData, value),
          }),
          {}
      );

      if (Object.values(newErrors).every((error) => !error)) {
        const response = await login(form.email, form.password);

        if (!response.success) {
          Alert.alert("Login Failed", response.message);
        }
        // No need to handle navigation here - useEffect will handle it
      }
    } catch (error) {
      Alert.alert(
          "Login Failed",
          error instanceof Error ? error.message : "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          <View className="relative w-full h-[280px]">
            {/*/!* Background Image with Overlay *!/*/}
            {/*<View className="absolute inset-0 bg-black/20">*/}
            {/*  <Image*/}
            {/*      source={images.login}*/}
            {/*      className="w-full h-full object-cover"*/}
            {/*      resizeMode="cover"*/}
            {/*  />*/}
            {/*</View>*/}
          </View>

          <View>
            <Text className="text-4xl font-jakartaBold text-primary-600 mb-8 text-center">
              Sign In
            </Text>
            <Text className="text-primary-500 font-jakartaSemiBold text-center text-2xl">
              Welcome back! Sign in to continue
            </Text>
          </View>

          <View className="px-6 py-8 flex-1">
            <View className="space-y-4">
              <InputField
                  label="Email"
                  icon={icons.email}
                  value={form.email}
                  keyboardType="email-address"
                  onChangeText={(text) => handleChange("email", text)}
                  onBlur={() => handleBlur("email")}
                  error={errors.email}
                  touched={touched.email}
                  required
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  iconStyle="w-6 h-6"
                  className="border-2 border-blue-400 rounded-xl focus:border-blue-600"
              />
              <InputField
                  label="Password"
                  icon={icons.lock}
                  secureTextEntry
                  value={form.password}
                  onChangeText={(text) => handleChange("password", text)}
                  onBlur={() => handleBlur("password")}
                  error={errors.password}
                  touched={touched.password}
                  required
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  iconStyle="w-6 h-6"
                  className="border-2 border-blue-400 rounded-xl focus:border-blue-600"
              />
            </View>

            <TouchableOpacity
                className="mt-2"
                onPress={() => router.push("/(auth)/reset-password")}
            >
              <Text className="text-right text-blue-500 font-jakartaMedium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <CustomButton
                title={loading ? "Signing In..." : "Sign In"}
                className="mt-8 p-4 rounded-xl"
                bgVariant="primary"
                disabled={!isFormValid || loading}
                onPress={handleSubmit}
            />

            <TouchableOpacity
                className="mt-6"
                onPress={() => router.push("/(auth)/membersignup")}
            >
              <Text className="text-center text-blue-500 font-jakartaMedium">
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
  );
};

export default SignIn;