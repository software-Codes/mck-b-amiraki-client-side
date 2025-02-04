import { Link, Stack } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function NotFoundScreen() {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <LinearGradient colors={['#1e293b', '#0f172a']} className="h-full items-center justify-center flex px-6">
                <Animated.Text
                    style={{ transform: [{ translateX: shakeAnim }] }}
                    className="text-red-500 text-3xl font-jakartaSemiBold mb-4 text-center"
                >
                    404 - Page Not Found
                </Animated.Text>

                <Text className="text-white text-lg text-center mb-6">
                    The page you're looking for doesn't exist or has been moved.
                </Text>

                <Link href="/" asChild>
                    <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-full">
                        <Text className="text-white text-lg font-semibold">Go Home</Text>
                    </TouchableOpacity>
                </Link>
            </LinearGradient>
        </>
    );
}
