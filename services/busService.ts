import { API_BASE_URL } from '../constants/config';

export interface NearbyStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

export interface ActiveBus {
  id: string;
  busNumber: string;
  routeId?: string | null;
  routeName?: string | null;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Fetch nearby bus stops given latitude and longitude.
 */
export const getNearbyStops = async (
  latitude: number,
  longitude: number,
): Promise<NearbyStop[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${API_BASE_URL}/stops/nearby?latitude=${encodeURIComponent(
      latitude,
    )}&longitude=${encodeURIComponent(longitude)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load nearby stops`);
    }

    const json = await response.json();

    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }

    if (Array.isArray(json)) {
      return json;
    }

    return [];
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Server connection timed out');
    }
    throw err;
  }
};

/**
 * Fetch all currently active buses.
 */
export const getActiveBuses = async (): Promise<ActiveBus[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${API_BASE_URL}/buses/active`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load active buses`);
    }

    const json = await response.json();

    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }

    if (json && json.data && Array.isArray(json.data.buses)) {
      return json.data.buses;
    }

    if (Array.isArray(json)) {
      return json;
    }

    return [];
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Server connection timed out');
    }
    throw err;
  }
};
