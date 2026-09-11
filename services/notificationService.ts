
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';
import { Router } from 'expo-router';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export async function registerForPushNotificationsAsync(authToken: string): Promise<string | null> {
  // Push notifications are NOT supported in Expo Go or on web
  if (Platform.OS === 'web') {
    console.log('Push notifications not supported on web');
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('  Push notification permission denied');
    return null;
  }

  // Get the Expo push token
  let expoPushToken: string | null = null;
  try {
    // projectId is read from app.json > extra.eas.projectId
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId || projectId === 'YOUR_EAS_PROJECT_ID') {
      console.warn(
        '  EAS projectId not configured in app.json. ' +
        'Run `eas init` and update app.json > extra.eas.projectId to enable push notifications.',
      );
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    expoPushToken = tokenData.data;
    console.log(' Expo push token obtained:', expoPushToken);
  } catch (error) {
    console.error(
      'Failed to get Expo push token. ' +
      'This is expected in Expo Go — use a development build instead.',
      error,
    );
    return null;
  }

  if (!expoPushToken) return null;

  // Register the token with the backend
  try {
    const response = await fetch(`${API_BASE_URL}/users/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token: expoPushToken,
        platform: Platform.OS,
      }),
    });

    if (response.ok) {
      console.log(' Push token registered with TEGA Bus backend');
    } else {
      const text = await response.text();
      console.warn('  Backend push token registration failed:', response.status, text);
    }
  } catch (networkErr) {
    console.warn('  Network error registering push token:', networkErr);
    // Non-fatal: token will be re-registered on next launch
  }

  return expoPushToken;
}



let _responseListener: Notifications.Subscription | null = null;


export function setupNotificationHandlers(router: Router): () => void {
  // Android: create a default notification channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('tega-alerts', {
      name: 'TEGA Bus Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0B3D66',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  // Listener: notification tapped while app is open or in background
  _responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('🔔 Notification tapped:', response.notification.request.content.data);
    router.push('/(tabs)/notifications');
  });

  // Handle killed-app tap: check if app was opened via a notification tap
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      console.log(' App opened via notification tap (killed-app)');
      // Small delay to let the navigator mount
      setTimeout(() => {
        router.push('/(tabs)/notifications');
      }, 500);
    }
  });

  // Return cleanup function
  return () => {
    if (_responseListener) {
      _responseListener.remove();
      _responseListener = null;
    }
  };
}
