import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { useEffect, useRef } from 'react';
import { LogBox } from 'react-native';
import { isPushNotificationSupported, registerForPushNotificationsAsync, setupNotificationHandlers,
} from '@/services/notificationService';

// Suppress known Expo Go push notification warnings in dev mode (remote push notifications removed from Expo Go Android in SDK 53)
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

function NotificationBootstrap() {
  const { token } = useAuth();
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);
  const registeredRef = useRef(false);

  // Set up tap handler once on mount
  useEffect(() => {
    if (!isPushNotificationSupported()) return;
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
    if (!isPushNotificationSupported()) return;
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
      {isPushNotificationSupported() && <NotificationBootstrap />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="saved-locations" />
        <Stack.Screen name="trip-details" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="personal-info" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </AuthProvider>
  );
}
