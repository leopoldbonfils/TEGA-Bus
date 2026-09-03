import { AuthProvider } from '@/context/AuthContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <AuthProvider>
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
