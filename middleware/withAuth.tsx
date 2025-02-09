// src/middleware/withAuth.tsx
import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

interface WithAuthProps {
  requireAuth?: boolean;
  requiredRole?: 'user' | 'admin';
}

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requireAuth = true, requiredRole }: WithAuthProps = {}
) => {
  return (props: P) => {
    const { user, isLoading, checkAuthStatus } = useAuth();

    useEffect(() => {
      checkAuthStatus();
    }, []);

    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    // If authentication is required and user is not logged in
    if (requireAuth && !user) {
      return <Redirect href="/(auth)/welcome" />;
    }

    // If user is logged in but trying to access auth pages
    if (!requireAuth && user) {
      return <Redirect href={user?.role === 'admin' ? '/(admin)/dashboard' : '/(root)/(tabs)/home'} />;
    }

    // Check for role-based access
    if (requiredRole && user?.role !== requiredRole) {
      return <Redirect href={user?.role === 'admin' ? '/(admin)/dashboard' : '/(root)/(tabs)/home'} />;
    }

    return <WrappedComponent {...props} />;
  };
};