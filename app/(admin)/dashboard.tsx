// screens/AdminDashboard.tsx
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define your navigation param list
type RootStackParamList = {
    Login: undefined;
    AdminDashboard: undefined;
    // Add other screens as needed
};

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'AdminDashboard'
>;

const AdminDashboard: React.FC = () => {
    const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
    const { isLoading, user, error, logout } = useAuth();

    useEffect(() => {
        if (error) {
            navigation.replace('Login');
        }
    }, [error, navigation]);

    const handleLogout = async (): Promise<void> => {
        await logout();
        navigation.replace('Login');
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" className="text-blue-500" />
                    <Text className="mt-4 text-gray-600 text-lg">
                        Loading...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-red-500 text-lg mb-4">
                        Please log in to access the dashboard
                    </Text>
                    <TouchableOpacity 
                        onPress={() => navigation.replace('Login')}
                        className="bg-blue-500 px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white text-lg font-semibold">
                            Go to Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white p-4 border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-800">
                    Admin Dashboard
                </Text>
            </View>

            <View className="flex-1 p-4">
                <View className="bg-white rounded-lg shadow-md p-4">
                    <Text className="text-xl font-semibold text-gray-800 mb-4">
                        Admin Details
                    </Text>
                    
                    <View className="space-y-2">
                        <View className="flex-row">
                            <Text className="text-gray-600 w-24">Name:</Text>
                            <Text className="text-gray-800 flex-1">
                                {user.name}
                            </Text>
                        </View>

                        <View className="flex-row">
                            <Text className="text-gray-600 w-24">Email:</Text>
                            <Text className="text-gray-800 flex-1">
                                {user.email}
                            </Text>
                        </View>

                        <View className="flex-row">
                            <Text className="text-gray-600 w-24">Role:</Text>
                            <Text className="text-gray-800 flex-1">
                                {user.role}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="mt-4 bg-red-500 p-4 rounded-lg"
                >
                    <Text className="text-white text-center font-semibold">
                        Logout
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AdminDashboard;