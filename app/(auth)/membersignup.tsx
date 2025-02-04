import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useState, useMemo } from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

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

const MemberSignup = () => {
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
    const [isAdmin, setIsAdmin] = useState(false);

    const validateField = (fieldName: keyof FormData, value: string) => {
        let error = '';
        
        if (!value.trim()) {
            error = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        } else {
            switch (fieldName) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        error = 'Please enter a valid email address';
                    }
                    break;
                case 'password':
                    if (value.length < 6) {
                        error = 'Password must be at least 6 characters long';
                    }
                    break;
                case 'phoneNumber':
                    const phoneRegex = /^\d{10}$/;
                    if (!phoneRegex.test(value)) {
                        error = 'Please enter a valid 10-digit phone number';
                    }
                    break;
            }
        }
        
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error;
    };

    const handleBlur = (fieldName: keyof FormData) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        validateField(fieldName, form[fieldName]);
    };

    const handleChange = (fieldName: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [fieldName]: value }));
        if (touched[fieldName]) {
            validateField(fieldName, value);
        }
    };

    const isFormValid = useMemo(() => {
        const allFieldsFilled = Object.values(form).every(value => value.trim() !== '');
        const noErrors = Object.values(errors).every(error => !error);
        return allFieldsFilled && noErrors;
    }, [form, errors]);

    const handleSubmit = () => {
        // Set all fields as touched to show all errors
        const allTouched = Object.keys(form).reduce((acc, key) => ({
            ...acc,
            [key]: true
        }), {});
        setTouched(allTouched as Record<keyof FormData, boolean>);

        // Validate all fields
        const newErrors = Object.entries(form).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: validateField(key as keyof FormData, value)
        }), {});

        if (Object.values(newErrors).every(error => !error)) {
            // Handle successful form submission
            console.log('Form submitted:', form);
        }
    };

  return (
    <ScrollView 
    className="flex-1 bg-white" 
    contentContainerStyle={{ flexGrow: 1 }}
    keyboardShouldPersistTaps="handled"
>
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px] overflow-hidden">
          <Image
            source={images.membersignup}
            className="w-full h-full object-cover"
          />
          <Text className="text-3xl font-jakartaSemiBold text-white absolute left-5 bottom-5">
            {isAdmin ? "Admin Registration" : "Member Registration"}
          </Text>
        </View>

        <View className="px-4 py-6">
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
          />
          <InputField
            label="Phone Number"
            icon={icons.dollar}
            keyboardType="phone-pad"
            value={form.phoneNumber}
            onChangeText={(text) => handleChange("phoneNumber", text)}
            onBlur={() => handleBlur("phoneNumber")}
            error={errors.phoneNumber}
            touched={touched.phoneNumber}
            required
            placeholder="Enter your phone number"
          />

          <TouchableOpacity
            className="flex-row items-center mt-4 p-2 rounded-lg bg-neutral-100"
            onPress={() => setIsAdmin(!isAdmin)}
          >
            <View
              className={`w-5 h-5 border rounded-md mr-2 
                            ${isAdmin ? "bg-primary-500 border-primary-500" : "border-neutral-400"}`}
            >
              {isAdmin && (
                <Image
                  source={icons.star}
                  className="w-full h-full tint-white"
                />
              )}
            </View>
            <Text className="font-jakartaMedium text-neutral-600">
              Register as Admin
            </Text>
          </TouchableOpacity>

          <CustomButton
                title="Register"
                className={`mt-6 p-4 rounded-xl ${!isFormValid ? 'opacity-50' : ''}`}
                bgVariant="primary"
                disabled={!isFormValid}
                onPress={handleSubmit}
            />
          <TouchableOpacity
            className="mt-4"
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text className="text-center text-primary-500 font-jakartaMedium underline">
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default MemberSignup;
