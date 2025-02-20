import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import 'react-native-reanimated';
import "../global.css";
import { AuthProvider } from '@/context/AuthContext';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
        "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
        "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
        "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
        "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
        "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    });

    const onLayoutRootView = useCallback(async () => {
        if (loaded) {
            // Only hide the splash screen after everything is ready
            await SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <AuthProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="(auth)"
                        options={{
                            headerShown: false,
                            // Prevent going back to the index screen
                            gestureEnabled: false
                        }}
                    />
                    <Stack.Screen
                        name="(root)"
                        options={{
                            headerShown: false,
                            // Prevent going back to auth screens
                            gestureEnabled: false
                        }}
                    />
                    <Stack.Screen
                        name="(admin)"
                        options={{
                            headerShown: false,
                            // Prevent going back to auth screens
                            gestureEnabled: false
                        }}
                    />
                    <Stack.Screen name="+not-found" />
                </Stack>
            </View>
        </AuthProvider>
    );
}