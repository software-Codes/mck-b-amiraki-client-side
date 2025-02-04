import { Text, View, Image, ScrollView, Alert } from "react-native";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import Button from "@/components/Button";
const SignUp = () => {
    const [form, setForm] = useState<SignUpForm>({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        role: "user",
        profilePhoto: undefined,
    });

    const [errors, setErrors] = useState<Partial<SignUpForm>>({});
    const [loading, setLoading] = useState(false);

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setForm({ ...form, profilePhoto: result.assets[0].uri });
        }
    };


    const handleSignUp = async () => {
        try {
            setLoading(true);
            // Add your API call here using the form data
            // Handle verification code for admin registration
            Alert.alert("Success", "Account created successfully!");
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="relative w-full h-[250px]">
                    <Image source={images.membersignup} className="z-0 w-full h-[250px]" />
                    <Text className="text-2xl font-jakartaSemiBold text-black absolute left-5 bottom-5">
                        Create your account
                    </Text>
                </View>

                <InputField
                    label="Full Name"
                    placeholder="Enter your full name"
                    icon={icons.person}
                    value={form.fullName}
                    onChangeText={(value) => setForm({ ...form, fullName: value })}
                    error={errors.fullName}
                    touched={!!form.fullName}
                    required
                />

                <InputField
                    label="Email"
                    placeholder="Enter your email"
                    icon={icons.email}
                    value={form.email}
                    onChangeText={(value) => setForm({ ...form, email: value })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    touched={!!form.email}
                    required
                />

                <InputField
                    label="Password"
                    placeholder="Enter your password"
                    icon={icons.lock}
                    value={form.password}
                    onChangeText={(value) => setForm({ ...form, password: value })}
                    secureTextEntry
                    error={errors.password}
                    touched={!!form.password}
                    required
                />

                <InputField
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    icon={icons.phone}
                    value={form.phoneNumber}
                    onChangeText={(value) => setForm({ ...form, phoneNumber: value })}
                    keyboardType="phone-pad"
                    error={errors.phoneNumber}
                    touched={!!form.phoneNumber}
                    required
                />

                <View className="px-5 my-2">
                    <Text className="text-lg font-jakartaSemiBold mb-3">Account Type</Text>
                    <View className="flex-row space-x-4">
                        <Button
                            title="User"
                            bgVariant={form.role === "user" ? "primary" : "outline"}
                            onPress={() => setForm({ ...form, role: "user" })}
                            className="flex-1"
                        />
                        <Button
                            title="Admin"
                            bgVariant={form.role === "admin" ? "primary" : "outline"}
                            onPress={() => setForm({ ...form, role: "admin" })}
                            className="flex-1"
                        />
                    </View>
                </View>

                <View className="px-5 my-2">
                    <Button
                        title="Add Profile Photo"
                        bgVariant="outline"
                        IconLeft={icons.camera}
                        onPress={handleImagePick}
                    />
                    {form.profilePhoto && (
                        <Image
                            source={{ uri: form.profilePhoto }}
                            className="w-20 h-20 rounded-full mt-2 self-center"
                        />
                    )}
                </View>

                <View className="px-5 my-4">
                    <Button
                        title={loading ? "Creating Account..." : "Sign Up"}
                        bgVariant="primary"
                        onPress={handleSignUp}
                        disabled={loading}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

export default SignUp;