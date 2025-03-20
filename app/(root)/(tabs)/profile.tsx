import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import * as Application from 'expo-application';
import { useFocusEffect } from '@react-navigation/native';
import {ActivityIndicator} from "react-native";
const AuthTestScreen = () => {  const { isAuthenticated, user, logout, isLoading } = useAuth();
    const [lastResumed, setLastResumed] = useState('');
    const [appState, setAppState] = useState({
        installationTime: '',
        lastUpdateTime: '',
    });

    // Update on focus (when returning to this screen)
    useFocusEffect(
        React.useCallback(() => {
            setLastResumed(new Date().toLocaleTimeString());

            // Check app install/update info if available
            const getAppInfo = async () => {
                try {
                    const installTime = await Application.getInstallationTimeAsync();
                    const lastUpdateTime = await Application.getLastUpdateTimeAsync();

                    setAppState({
                        installationTime: new Date(installTime).toLocaleString(),
                        lastUpdateTime: lastUpdateTime ? new Date(lastUpdateTime).toLocaleString() : 'N/A',
                    });
                } catch (error) {
                    console.log('Could not get app info', error);
                }
            };

            getAppInfo();

            return () => {
                // Cleanup if needed
            };
        }, [])
    );


    return (
        <View style={styles.container}>
            if(isLoading)
            {
                <ActivityIndicator size='large' className="color-blue-500" />
            }
            <Text style={styles.title}>Auth Test</Text>
            <Text style={styles.status}>
                Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
            </Text>
            <Text style={styles.text}>Last resumed: {lastResumed}</Text>

            {user && (
                <View style={styles.userInfo}>
                    <Text style={styles.subtitle}>User Info:</Text>
                    <Text>ID: {user.id}</Text>
                    <Text>Email: {user.email}</Text>
                    <Text>Role: {user.role}</Text>
                </View>
            )}

            {isAuthenticated && (
                <Button title="Logout" onPress={logout} />
            )}
            <Text>App installed: {appState.installationTime}</Text>
            <Text>Last updated: {appState.lastUpdateTime}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    status: {
        fontSize: 18,
        marginBottom: 20,
    },
    text: {
        marginBottom: 15,
    },
    userInfo: {
        marginVertical: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
});

export default AuthTestScreen;