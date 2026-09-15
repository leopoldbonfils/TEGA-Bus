import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as ExpoEnv from 'expo';
import {isExpoGo, isPushNotificationSupported, registerForPushNotificationsAsync, setupNotificationHandlers,
} from '../../services/notificationService';
import { API_BASE_URL } from '../../constants/config';

// Mock external dependencies
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  addNotificationResponseReceivedListener: jest.fn(),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  AndroidImportance: {
    HIGH: 4,
  },
}));

jest.mock('expo', () => ({
  isRunningInExpoGo: jest.fn(() => false),
}));

jest.mock('expo-constants', () => ({
  appOwnership: 'standalone',
  expoConfig: {
    extra: {
      eas: {
        projectId: 'valid-project-id-123',
      },
    },
  },
}));

describe('notificationService', () => {
  const originalPlatformOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(false);
    (Constants as any).appOwnership = 'standalone';
  });

  afterEach(() => {
    Platform.OS = originalPlatformOS;
  });

  describe('isExpoGo and isPushNotificationSupported', () => {
    it('detects Expo Go via isRunningInExpoGo or appOwnership', () => {
      (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(true);
      expect(isExpoGo()).toBe(true);

      (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(false);
      (Constants as any).appOwnership = 'expo';
      expect(isExpoGo()).toBe(true);

      (Constants as any).appOwnership = 'standalone';
      expect(isExpoGo()).toBe(false);
    });

    it('returns false on web', () => {
      Platform.OS = 'web';
      expect(isPushNotificationSupported()).toBe(false);
    });

    it('returns false in Expo Go on Android', () => {
      Platform.OS = 'android';
      (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(true);
      expect(isPushNotificationSupported()).toBe(false);
    });

    it('returns true for development / standalone builds on Android', () => {
      Platform.OS = 'android';
      (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(false);
      (Constants as any).appOwnership = 'standalone';
      expect(isPushNotificationSupported()).toBe(true);
    });

    it('returns true on iOS even in Expo Go', () => {
      Platform.OS = 'ios';
      (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(true);
      expect(isPushNotificationSupported()).toBe(true);
    });
  });

  describe('registerForPushNotificationsAsync', () => {
    it('returns null on web platform without requesting permissions', async () => {
      Platform.OS = 'web';

      const token = await registerForPushNotificationsAsync('test-token');
      expect(token).toBeNull();
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });

    it('returns null in Expo Go on Android without requesting permissions', async () => {
      Platform.OS = 'android';
      (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(true);

      const token = await registerForPushNotificationsAsync('test-token');
      expect(token).toBeNull();
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });

    it('returns null if permissions are not granted and request is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const token = await registerForPushNotificationsAsync('test-token');
      expect(token).toBeNull();
    });

    it('returns null when EAS projectId is not configured', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      // Temporarily remove projectId
      const originalConfig = Constants.expoConfig;
      (Constants as any).expoConfig = { extra: { eas: { projectId: 'YOUR_EAS_PROJECT_ID' } } };

      const token = await registerForPushNotificationsAsync('test-token');
      expect(token).toBeNull();

      (Constants as any).expoConfig = originalConfig;
    });

    it('fetches push token and registers it with backend when permissions are granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[mock-token-abc]',
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      });

      const token = await registerForPushNotificationsAsync('auth-jwt-token');

      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: 'valid-project-id-123',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/push-token`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer auth-jwt-token',
          }),
          body: JSON.stringify({
            token: 'ExponentPushToken[mock-token-abc]',
            platform: 'ios',
          }),
        })
      );

      expect(token).toBe('ExponentPushToken[mock-token-abc]');
    });
  });

  describe('setupNotificationHandlers', () => {
    it('sets up notification response listener and returns cleanup function', () => {
      const mockRemove = jest.fn();
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      const mockRouter = {
        push: jest.fn(),
      } as any;

      const cleanup = setupNotificationHandlers(mockRouter);

      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();

      cleanup();
      expect(mockRemove).toHaveBeenCalled();
    });

    it('configures android notification channel when running on Android (standalone/dev)', () => {
      Platform.OS = 'android';
      (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(false);

      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
        remove: jest.fn(),
      });

      const mockRouter = { push: jest.fn() } as any;

      setupNotificationHandlers(mockRouter);

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'tega-alerts',
        expect.objectContaining({
          name: 'TEGA Bus Alerts',
        })
      );
    });

    it('returns a no-op cleanup and skips native listeners on web', () => {
      Platform.OS = 'web';

      const mockRouter = { push: jest.fn() } as any;

      const cleanup = setupNotificationHandlers(mockRouter);

      expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled();
      expect(Notifications.getLastNotificationResponseAsync).not.toHaveBeenCalled();
      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });

    it('returns a no-op cleanup and skips native listeners in Expo Go on Android', () => {
      Platform.OS = 'android';
      (ExpoEnv.isRunningInExpoGo as jest.Mock).mockReturnValue(true);

      const mockRouter = { push: jest.fn() } as any;

      const cleanup = setupNotificationHandlers(mockRouter);

      expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled();
      expect(Notifications.getLastNotificationResponseAsync).not.toHaveBeenCalled();
      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });
  });
});
