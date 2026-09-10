import { API_BASE_URL } from '../constants/config';

export interface StopBus {
  id: string;
  busNumber: string;
  plateNumber: string;
  direction: string;
  routeName: string;
  speed: number;
  isMoving: boolean;
  motionStatus: 'MOVING' | 'PARKED';
}

export interface StopDirectionGroup {
  direction: string;
  buses: StopBus[];
}

export interface NearbyStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  availableBusNumbers?: string[];
  buses?: StopBus[];
  directions?: StopDirectionGroup[];
}

export interface ActiveBus {
  id: string;
  busNumber: string;
  plateNumber?: string;
  routeId?: string | null;
  routeName?: string | null;
  status: string;
  speed?: number;
}

export interface RecommendedBus {
  id: string;
  busNumber: string;
  plateNumber: string;
  capacity?: number;
  driverName: string;
  routeName: string;
  routeNumber: string;
  destination?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  currentStop: string;
  nextStop: string;
  distanceKm: number;
  distanceMeters: number;
  etaMinutes: number;
  status: string;
  isApproaching: boolean;
  isMoving?: boolean;
  motionStatus?: 'MOVING' | 'PARKED';
  rating?: number;
  seatsRemaining?: number;
  tripStops?: Array<{
    name: string;
    status?: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
    etaMinutes?: number;
    time?: string;
  }>;
  rating?: number;
  seatsRemaining?: number;
  tripStops?: Array<{
    name: string;
    status?: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
    etaMinutes?: number;
    time?: string;
  }>;
}

export interface UpcomingTrip {
  id: string;
  tripId?: string;
  routeNumber: string;
  routeName: string;
  destination: string;
  time: string;
  etaMinutes: number;
  status: 'Arriving' | 'Boarding' | 'Scheduled' | 'Departed';
  statusLabel: string;
  busNumber: string;
  plateNumber: string;
  driverName: string;
  currentStop: string;
  nextStop: string;
  isMoving: boolean;
  speed: number;
  distanceMeters: number;
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

/**
 * Smart Discovery: Fetch active buses heading toward a requested destination
 * and approaching passenger's location. If destination is omitted, returns all
 * active buses approaching the passenger.
 */
export const getNearbyBusesForDestination = async (
  latitude: number,
  longitude: number,
  destination?: string,
): Promise<RecommendedBus[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let url = `${API_BASE_URL}/buses/nearby?latitude=${encodeURIComponent(
      latitude,
    )}&longitude=${encodeURIComponent(longitude)}`;

    if (destination && destination.trim()) {
      url += `&destination=${encodeURIComponent(destination.trim())}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to find buses`);
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
 * Fetch buses currently near the passenger's location.
 */
export const getNearbyBuses = async (
  latitude: number,
  longitude: number,
): Promise<RecommendedBus[]> => {
  return getNearbyBusesForDestination(latitude, longitude);
};

/** Fetch one live bus from the backend using the passenger's location. */
export const getBusDetails = async (
  latitude: number,
  longitude: number,
  busId: string,
): Promise<RecommendedBus> => {
  const buses = await getNearbyBuses(latitude, longitude);
  const bus = buses.find((candidate) => candidate.id === busId);

  if (!bus) {
    throw new Error('Bus details are no longer available');
  }

  return bus;
};

export const getUpcomingTrip = async (
  latitude: number,
  longitude: number,
): Promise<UpcomingTrip | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${API_BASE_URL}/buses/upcoming-trip?latitude=${encodeURIComponent(
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
      return null;
    }

    const json = await response.json();

    if (json && json.success && json.data) {
      return json.data;
    }

    return null;
  } catch {
    return null;
  }
};
