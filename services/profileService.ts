import { API_BASE_URL } from '../constants/config';
import { User } from '../context/AuthContext';

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Trip {
  id: string;
  status: string;
  origin: string;
  destination: string;
  date: string;
  fare: number;
  paymentMethod?: string;
  busNumber?: string;
  routeNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  details?: string;
  balance?: number;
}

const request = async <T>(token: string, path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.message || `Request failed (${response.status})`);
  }

  return json?.data ?? json;
};

const asList = <T>(value: unknown, keys: string[] = []): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    for (const key of keys) {
      const nested = (value as Record<string, unknown>)[key];
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  return [];
};

export const getCurrentUser = (token: string) => request<User>(token, '/auth/me');

export const getTrips = async (token: string): Promise<Trip[]> =>
  asList<Trip>(await request<unknown>(token, '/trips'), ['trips', 'items']);

export const getSavedLocations = async (token: string): Promise<SavedLocation[]> =>
  asList<SavedLocation>(await request<unknown>(token, '/saved-locations'), ['locations', 'items']);

export const getPaymentMethods = async (token: string): Promise<PaymentMethod[]> =>
  asList<PaymentMethod>(await request<unknown>(token, '/payment-methods'), ['methods', 'items']);
