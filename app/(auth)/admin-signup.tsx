import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useState, useMemo } from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { useAdminSignup } from "@/actions/admin-register";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
}

const AdminSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const gotoVerifyEmail = () => router.push("/(auth)/verify-email");

  const { handleAdminSignup } = useAdminSignup();
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    fullName: false,
    email: false,
    password: false,
    phoneNumber: false,
  });

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
          if (value.length < 8 && value.trim()) {
            error = "Password must be at least 8 characters long";
          }
          break;
        case "phoneNumber":
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(value)) {
            error = "Please enter a valid 10-digit phone number";
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
      setIsLoading(true);
      try {
        const result = await handleAdminSignup(form);
        if (result.success) {
          Alert.alert("Success",  result.message, [
            {
              text: "OK",
              onPress: gotoVerifyEmail,
            },
          ]);
        } else {
          Alert.alert("Error", result.message);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "An unexpected error occurred. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
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
          {/* Background Image with Overlay */}
          <View className="absolute inset-0 bg-black/20">
            <Image
              source={images.membersignup}
              className="w-full h-full object-cover"
              resizeMode="cover"
            />
          </View>

          {/* Welcome Text Container */}
          <View className="absolute inset-0 flex items-center font-jakartaBold justify-end px-6">
            <View className="space-y-2 ">
              <Text className="text-4xl font-jakartaBold text-primary-600">
                Admin Sign Up
              </Text>
              <Text className="text-2xl font-jakartaMedium text-primary-500">
                Create an account
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-8">
          <InputField
            label="Full Name"
            icon={icons.person}
            value={form.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
            onBlur={() => handleBlur("fullName")}
            error={errors.fullName}
            touched={touched.fullName}
            required
            placeholder="Enter your full name"
            iconStyle="w-6 h-6"
            className="border-2 border-blue-400 rounded-xl focus:border-blue-600"
          />
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
          <InputField
            label="Phone Number"
            icon={icons.profile}
            keyboardType="phone-pad"
            value={form.phoneNumber}
            onChangeText={(text) => handleChange("phoneNumber", text)}
            onBlur={() => handleBlur("phoneNumber")}
            error={errors.phoneNumber}
            touched={touched.phoneNumber}
            required
            placeholder="Enter your phone number"
            iconStyle="w-6 h-6"
            className="border-2 border-blue-400 rounded-xl focus:border-blue-600"
          />

          <TouchableOpacity
            className="mt-4"
            onPress={() => router.push("/(auth)/membersignup")}
          >
            <Text className="text-blue-500 font-jakartaMedium underline">
              Register as member
            </Text>
          </TouchableOpacity>

          <CustomButton
            title={isLoading ? "Registering admin..." : "Register"}
            className="mt-8 p-4 rounded-xl"
            bgVariant="primary"
            disabled={!isFormValid || isLoading}
            onPress={handleSubmit}
          />

          <TouchableOpacity
            className="mt-6"
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text className="text-center text-blue-500 font-jakartaMedium underline">
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AdminSignup;
