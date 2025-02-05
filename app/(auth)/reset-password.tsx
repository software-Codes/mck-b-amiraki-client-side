import {Text, View, TouchableOpacity, ScrollView, Image} from "react-native";
import { useState, useCallback } from "react";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { icons, images } from "@/constants";
import { Check, X } from "lucide-react-native";
import { router } from "expo-router";




const ResetPassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showValidation, setShowValidation] = useState(false);
    const [touched, setTouched] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const validatePassword = useCallback((password: string): PasswordValidation => {
        return {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            matches: password === confirmPassword,
        };
    }, [confirmPassword]);

    const validation = validatePassword(newPassword);
    const isValidPassword = Object.values(validation).every(Boolean);

    const ValidationIndicator = ({ isValid }: { isValid: boolean }) => (
        <View className="ml-2">
            {isValid ? (
                <Check size={16} color="#38A169" /> // success-500 color
            ) : (
                <X size={16} color="#E53E3E" /> // danger-600 color
            )}
        </View>
    );

    const handleSubmit = () => {
        if (isValidPassword) {
            // Handle password change logic
            console.log("Password changed successfully");
        }
    };
const goBack = () => {
        router.push("/(auth)/sign-in");
}
    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-4">
                <TouchableOpacity className="mb-4" onPress={goBack}>
                    <Image source={icons.backArrow} className="w-6 h-6" />
                </TouchableOpacity>

                {/*<View className="items-center mb-8">*/}
                {/*    <Image source={images.login} className="w-full h-48px " />*/}
                {/*</View>*/}

                <Text className="text-3xl font-jakartaBold text-primary-600 mb-8 text-center">
                    Reset Password
                </Text>

                <View className="space-y-4" >
                    <InputField
                        label="Old Password"
                        placeholder="Enter your old password"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry
                        required
                        touched={touched.oldPassword}
                        onBlur={() => setTouched(prev => ({ ...prev, oldPassword: true }))}
                        error={touched.oldPassword && !oldPassword ? "Old password is required" : ""}
                        className="border border-primary-500"
                    />

                    <InputField
                        label="New Password"
                        placeholder="Enter your new password"
                        className="border border-primary-500"
                        value={newPassword}
                        onChangeText={(text) => {
                            setNewPassword(text);
                            setShowValidation(true);
                        }}
                        secureTextEntry
                        required
                        touched={touched.newPassword}
                        onBlur={() => setTouched(prev => ({ ...prev, newPassword: true }))}
                        error={touched.newPassword && !newPassword ? "New password is required" : ""}
                    />

                    <InputField
                        label="Confirm Password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        required
                        className="border border-primary-500"
                        touched={touched.confirmPassword}
                        onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                        error={touched.confirmPassword && !validation.matches ? "Passwords do not match" : ""}
                    />

                    {showValidation && (
                        <View className="bg-neutral-50 p-4 rounded-lg">
                            <Text className="font-jakartaSemiBold mb-2 text-secondary-900">
                                Password Requirements:
                            </Text>
                            <View className="space-y-2">
                                <View className="flex-row items-center">
                                    <ValidationIndicator isValid={validation.minLength} />
                                    <Text className="ml-2 text-secondary-700">
                                        Minimum 8 characters
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <ValidationIndicator isValid={validation.hasUppercase} />
                                    <Text className="ml-2 text-secondary-700">
                                        At least one uppercase letter
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <ValidationIndicator isValid={validation.hasLowercase} />
                                    <Text className="ml-2 text-secondary-700">
                                        At least one lowercase letter
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <ValidationIndicator isValid={validation.hasNumber} />
                                    <Text className="ml-2 text-secondary-700">
                                        At least one number
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <ValidationIndicator isValid={validation.hasSpecialChar} />
                                    <Text className="ml-2 text-secondary-700">
                                        At least one special character
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <ValidationIndicator isValid={validation.matches} />
                                    <Text className="ml-2 text-secondary-700">
                                        Passwords match
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View className="mt-8">
                    <CustomButton
                        title="Change Password"
                        bgVariant="primary"
                        size="lg"
                        disabled={!isValidPassword}
                        onPress={handleSubmit}
                        className="w-full p-4"

                    />
                </View>
            </View>
        </ScrollView>
    );
};

export default ResetPassword;