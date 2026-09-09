import { API_BASE_URL } from '../constants/config';
export * from './busService';

export interface RouteStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface BusRoute {
  id: string;
  name: string;
  startLocation: string;
  destination: string;
  fare: number;
  estimatedDuration: number;
  distanceKm?: number;
  stops?: RouteStop[];
  buses?: Array<{ id: string; busNumber: string; status: string }>;
  activeBusCount?: number;
}

/**
 * Fallback routes if the backend is waking up or offline.
 */
export const FALLBACK_ROUTES: BusRoute[] = [
  {
    id: 'route-101',
    name: '101',
    startLocation: 'Kigali',
    destination: 'Nyabugogo',
    fare: 500,
    estimatedDuration: 25,
    stops: [
      { id: 's1', name: 'Downtown', latitude: -1.9500, longitude: 30.0580, order: 1 },
      { id: 's2', name: 'Kigali City', latitude: -1.9536, longitude: 30.0605, order: 2 },
      { id: 's3', name: 'Rwandex', latitude: -1.9480, longitude: 30.0500, order: 3 },
      { id: 's4', name: 'Kacyiru', latitude: -1.9405, longitude: 30.0820, order: 4 },
      { id: 's5', name: 'Nyabugogo', latitude: -1.9346, longitude: 30.0540, order: 5 },
    ],
  },
  {
    id: 'route-102',
    name: '102',
    startLocation: 'Downtown',
    destination: 'Kicukiro',
    fare: 500,
    estimatedDuration: 40,
    stops: [
      { id: 's6', name: 'Downtown', latitude: -1.9500, longitude: 30.0580, order: 1 },
      { id: 's7', name: 'Sonatubes', latitude: -1.9612, longitude: 30.0965, order: 2 },
      { id: 's8', name: 'Kicukiro Centre', latitude: -1.9750, longitude: 30.1000, order: 3 },
    ],
  },
  {
    id: 'route-202',
    name: '202',
    startLocation: 'Nyabugogo',
    destination: 'Kimironko',
    fare: 400,
    estimatedDuration: 35,
    stops: [
      { id: 's9', name: 'Nyabugogo', latitude: -1.9346, longitude: 30.0540, order: 1 },
      { id: 's10', name: 'Kacyiru', latitude: -1.9405, longitude: 30.0820, order: 2 },
      { id: 's11', name: 'Remera', latitude: -1.9502, longitude: 30.1073, order: 3 },
      { id: 's12', name: 'Kimironko Terminus', latitude: -1.9400, longitude: 30.1200, order: 4 },
    ],
  },
  {
    id: 'route-203',
    name: '203',
    startLocation: 'Nyabugogo',
    destination: 'Remera',
    fare: 300,
    estimatedDuration: 25,
    stops: [
      { id: 's13', name: 'Nyabugogo', latitude: -1.9346, longitude: 30.0540, order: 1 },
      { id: 's14', name: 'Kigali City', latitude: -1.9536, longitude: 30.0605, order: 2 },
      { id: 's15', name: 'Gisimenti', latitude: -1.9540, longitude: 30.1030, order: 3 },
      { id: 's16', name: 'Remera Bus Park', latitude: -1.9502, longitude: 30.1073, order: 4 },
    ],
  },
];

/**
 * Fetch all bus routes from backend.
 */
export const getAllRoutes = async (): Promise<BusRoute[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/routes`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return FALLBACK_ROUTES;
    }

    const json = await response.json();

    if (json && json.success && json.data && Array.isArray(json.data.routes)) {
      return json.data.routes;
    }

    if (json && json.data && Array.isArray(json.data)) {
      return json.data;
    }

    if (Array.isArray(json)) {
      return json;
    }

    return FALLBACK_ROUTES;
  } catch (err) {
    return FALLBACK_ROUTES;
  }
};

/**
 * Search routes by from and to, or destination query.
 */
export const searchRoutes = async (from?: string, to?: string): Promise<BusRoute[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const queryParams = new URLSearchParams();
    if (from && from.trim()) queryParams.append('from', from.trim());
    if (to && to.trim()) queryParams.append('to', to.trim());

    const url = `${API_BASE_URL}/routes/search?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const json = await response.json();

    if (json && json.success && json.data && Array.isArray(json.data.routes)) {
      return json.data.routes;
    }

    if (json && json.data && Array.isArray(json.data)) {
      return json.data;
    }

    return [];
  } catch (err) {
    return [];
  }
};
