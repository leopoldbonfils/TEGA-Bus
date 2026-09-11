import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { useEffect, useRef } from 'react';
import {registerForPushNotificationsAsync, setupNotificationHandlers,} from '@/services/notificationService';

function NotificationBootstrap() {
  const { token } = useAuth();
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);
  const registeredRef = useRef(false);

  // Set up tap handler once on mount
  useEffect(() => {
    const cleanup = setupNotificationHandlers(router);
    cleanupRef.current = cleanup;
    return () => {
      cleanup();
      cleanupRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register push token whenever the auth token is available
  useEffect(() => {
    if (token && !registeredRef.current) {
      registeredRef.current = true;
      registerForPushNotificationsAsync(token).catch((err) => {
        console.warn('Push registration error:', err);
        // Allow retry on next token change
        registeredRef.current = false;
      });
    }
    // Reset so we register again if the user logs out and back in
    if (!token) {
      registeredRef.current = false;
    }
  }, [token]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationBootstrap />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="saved-locations" />
        <Stack.Screen name="trip-details" />
        <Stack.Screen name="payment" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </AuthProvider>
  );
}
