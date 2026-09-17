import { API_BASE_URL } from '../constants/config';

export type TripStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TripStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  time?: string;
  status?: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
}

export interface TripRoute {
  id: string;
  name: string;
  startLocation: string;
  destination: string;
  fare: number;
  estimatedDuration: number;
  stops?: TripStop[];
}

export interface TripBusLocation {
  id?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp?: string;
}

export interface TripBus {
  id: string;
  busNumber: string;
  plateNumber: string;
  capacity?: number;
  status?: string;
  locations?: TripBusLocation[];
}

export interface TripDriver {
  id: string;
  driverNumber?: string;
  status?: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  routeId: string;
  status: TripStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt?: string;
  bus: TripBus;
  driver?: TripDriver;
  route: TripRoute;
  // Computed / UI helper fields
  speed?: number;
  etaMinutes?: number;
  distanceKm?: number;
  formattedTime?: string;
}

/**
 * Fallback trips used when the backend is waking up or offline.
 */
export const FALLBACK_TRIPS: Trip[] = [
  // ── Upcoming Trips ──
  {
    id: 'trip-up-1',
    busId: 'bus-305',
    driverId: 'drv-003',
    routeId: 'route-305',
    status: 'SCHEDULED',
    startedAt: null,
    endedAt: null,
    createdAt: new Date().toISOString(),
    formattedTime: 'Today, 04:30 PM',
    etaMinutes: 70,
    route: {
      id: 'route-305',
      name: 'Route 5',
      startLocation: 'Nyabugogo',
      destination: 'Kimironko',
      fare: 500,
      estimatedDuration: 35,
      stops: [
        { id: 's1', name: 'Nyabugogo', latitude: -1.9355, longitude: 30.0540, order: 1, time: '04:30 PM' },
        { id: 's2', name: 'Gisozi', latitude: -1.9315, longitude: 30.0645, order: 2, time: '04:42 PM' },
        { id: 's3', name: 'Kagugu', latitude: -1.9180, longitude: 30.0785, order: 3, time: '04:52 PM' },
        { id: 's4', name: 'Kimironko', latitude: -1.9400, longitude: 30.1200, order: 4, time: '05:05 PM' },
      ],
    },
    bus: {
      id: 'bus-305',
      busNumber: '305',
      plateNumber: 'RAD 305 B',
      capacity: 50,
      status: 'ACTIVE',
    },
    driver: {
      id: 'drv-003',
      driverNumber: 'DRV-003',
      user: { name: 'Samuel Habimana', email: 'driver3@tegabus.com' },
    },
  },
  {
    id: 'trip-up-2',
    busId: 'bus-101',
    driverId: 'drv-001',
    routeId: 'route-101',
    status: 'SCHEDULED',
    startedAt: null,
    endedAt: null,
    createdAt: new Date().toISOString(),
    formattedTime: 'Tomorrow, 07:00 AM',
    etaMinutes: 45,
    route: {
      id: 'route-101',
      name: 'Route 1',
      startLocation: 'Remera',
      destination: 'Downtown Terminal',
      fare: 500,
      estimatedDuration: 40,
      stops: [
        { id: 's5', name: 'Remera Bus Park', latitude: -1.9502, longitude: 30.1073, order: 1, time: '07:00 AM' },
        { id: 's6', name: 'Gisimenti', latitude: -1.9540, longitude: 30.1030, order: 2, time: '07:12 AM' },
        { id: 's7', name: 'Rwandex', latitude: -1.9480, longitude: 30.0500, order: 3, time: '07:25 AM' },
        { id: 's8', name: 'Downtown Terminal', latitude: -1.9500, longitude: 30.0580, order: 4, time: '07:40 AM' },
      ],
    },
    bus: {
      id: 'bus-101',
      busNumber: '101',
      plateNumber: 'RAB 101 A',
      capacity: 45,
      status: 'ACTIVE',
    },
    driver: {
      id: 'drv-001',
      driverNumber: 'DRV-001',
      user: { name: 'Jean-Pierre Nkurunziza', email: 'driver@tegabus.com' },
    },
  },

  // ── Active Trips ──
  {
    id: 'trip-act-1',
    busId: 'bus-402',
    driverId: 'drv-002',
    routeId: 'route-202',
    status: 'ACTIVE',
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    speed: 32,
    distanceKm: 1.2,
    etaMinutes: 15,
    route: {
      id: 'route-202',
      name: 'Route 3',
      startLocation: 'Kimironko',
      destination: 'Downtown Terminal',
      fare: 500,
      estimatedDuration: 38,
      stops: [
        { id: 's9', name: 'Kimironko', latitude: -1.9400, longitude: 30.1200, order: 1, time: '14:30 PM', status: 'COMPLETED' },
        { id: 's10', name: 'Gisimenti', latitude: -1.9540, longitude: 30.1030, order: 2, time: '14:45 PM', status: 'CURRENT' },
        { id: 's11', name: 'Downtown Terminal', latitude: -1.9500, longitude: 30.0580, order: 3, time: '15:15 PM', status: 'UPCOMING' },
      ],
    },
    bus: {
      id: 'bus-402',
      busNumber: '402',
      plateNumber: 'RAC 402 A',
      capacity: 45,
      status: 'ON_TRIP',
      locations: [{ latitude: -1.9450, longitude: 30.0800, speed: 32, heading: 240 }],
    },
    driver: {
      id: 'drv-002',
      driverNumber: 'DRV-002',
      user: { name: 'Diane Uwamahoro', email: 'driver2@tegabus.com' },
    },
  },
  {
    id: 'trip-act-2',
    busId: 'bus-302',
    driverId: 'drv-004',
    routeId: 'route-202-b',
    status: 'ACTIVE',
    startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    speed: 28,
    distanceKm: 2.1,
    etaMinutes: 18,
    route: {
      id: 'route-202-b',
      name: 'Route 2',
      startLocation: 'Nyabugogo',
      destination: 'Kimironko',
      fare: 400,
      estimatedDuration: 35,
      stops: [
        { id: 's12', name: 'Nyabugogo', latitude: -1.9346, longitude: 30.0540, order: 1, time: '14:30 PM', status: 'COMPLETED' },
        { id: 's13', name: 'Kacyiru', latitude: -1.9405, longitude: 30.0820, order: 2, time: '14:48 PM', status: 'CURRENT' },
        { id: 's14', name: 'Remera', latitude: -1.9502, longitude: 30.1073, order: 3, time: '15:00 PM', status: 'UPCOMING' },
        { id: 's15', name: 'Kimironko', latitude: -1.9400, longitude: 30.1200, order: 4, time: '15:15 PM', status: 'UPCOMING' },
      ],
    },
    bus: {
      id: 'bus-302',
      busNumber: '302',
      plateNumber: 'RAB 302 D',
      capacity: 40,
      status: 'ON_TRIP',
      locations: [{ latitude: -1.9405, longitude: 30.0820, speed: 28, heading: 90 }],
    },
    driver: {
      id: 'drv-004',
      driverNumber: 'DRV-004',
      user: { name: 'Grace Ingabire', email: 'driver4@tegabus.com' },
    },
  },

  // ── Completed Trips ──
  {
    id: 'trip-comp-1',
    busId: 'bus-105',
    driverId: 'drv-005',
    routeId: 'route-105',
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    endedAt: new Date(Date.now() - 84000000).toISOString(),
    formattedTime: 'Yesterday, 17:45 PM',
    route: {
      id: 'route-105',
      name: 'Route 105',
      startLocation: 'Remera',
      destination: 'Nyabugogo',
      fare: 500,
      estimatedDuration: 30,
      stops: [
        { id: 's16', name: 'Remera', latitude: -1.9502, longitude: 30.1073, order: 1 },
        { id: 's17', name: 'Nyabugogo', latitude: -1.9346, longitude: 30.0540, order: 2 },
      ],
    },
    bus: {
      id: 'bus-105',
      busNumber: '105',
      plateNumber: 'RAB 105 C',
      capacity: 40,
      status: 'ACTIVE',
    },
  },
  {
    id: 'trip-comp-2',
    busId: 'bus-203',
    driverId: 'drv-001',
    routeId: 'route-203',
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 90000000).toISOString(),
    endedAt: new Date(Date.now() - 88000000).toISOString(),
    formattedTime: 'Yesterday, 14:20 PM',
    route: {
      id: 'route-203',
      name: 'Route 203',
      startLocation: 'Nyabugogo',
      destination: 'Downtown',
      fare: 500,
      estimatedDuration: 25,
      stops: [
        { id: 's18', name: 'Nyabugogo', latitude: -1.9346, longitude: 30.0540, order: 1 },
        { id: 's19', name: 'Downtown', latitude: -1.9500, longitude: 30.0580, order: 2 },
      ],
    },
    bus: {
      id: 'bus-203',
      busNumber: '203',
      plateNumber: 'RAB 203 C',
      capacity: 30,
      status: 'ACTIVE',
    },
  },
  {
    id: 'trip-comp-3',
    busId: 'bus-204',
    driverId: 'drv-002',
    routeId: 'route-204',
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    endedAt: new Date(Date.now() - 170000000).toISOString(),
    formattedTime: 'Oct 24, 09:00 AM',
    route: {
      id: 'route-204',
      name: 'Route 204',
      startLocation: 'Nyabugogo',
      destination: 'Remera',
      fare: 450,
      estimatedDuration: 25,
      stops: [
        { id: 's20', name: 'Nyabugogo', latitude: -1.9346, longitude: 30.0540, order: 1 },
        { id: 's21', name: 'Remera', latitude: -1.9502, longitude: 30.1073, order: 2 },
      ],
    },
    bus: {
      id: 'bus-204',
      busNumber: '204',
      plateNumber: 'RAB 204 D',
      capacity: 35,
      status: 'ACTIVE',
    },
  },
];

/**
 * Normalize raw trip objects from API to Trip interface.
 */
function normalizeTrip(raw: any): Trip {
  const latestLoc =
    raw.bus?.locations && Array.isArray(raw.bus.locations) && raw.bus.locations.length > 0
      ? raw.bus.locations[0]
      : null;

  const speed = raw.speed ?? (latestLoc ? Math.round(latestLoc.speed || 0) : 30);
  const distanceKm = raw.distanceKm ?? 1.5;
  const etaMinutes =
    raw.etaMinutes ??
    (raw.route?.estimatedDuration ? Math.round(raw.route.estimatedDuration / 2) : 15);

  let formattedTime = raw.formattedTime;
  if (!formattedTime && raw.startedAt) {
    const d = new Date(raw.startedAt);
    formattedTime = `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (!formattedTime && raw.createdAt) {
    const d = new Date(raw.createdAt);
    formattedTime = `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return {
    id: raw.id,
    busId: raw.busId,
    driverId: raw.driverId,
    routeId: raw.routeId,
    status: raw.status,
    startedAt: raw.startedAt,
    endedAt: raw.endedAt,
    createdAt: raw.createdAt,
    bus: raw.bus || {
      id: raw.busId,
      busNumber: 'Bus',
      plateNumber: '',
      capacity: 40,
    },
    driver: raw.driver,
    route: raw.route || {
      id: raw.routeId,
      name: 'Route',
      startLocation: 'Start',
      destination: 'Destination',
      fare: 500,
      estimatedDuration: 30,
      stops: [],
    },
    speed,
    etaMinutes,
    distanceKm,
    formattedTime: formattedTime || 'Today',
  };
}

/**
 * Fetch all trips with optional status filter (e.g. ACTIVE, SCHEDULED, COMPLETED).
 */
export const getAllTrips = async (status?: TripStatus): Promise<Trip[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = status ? `${API_BASE_URL}/trips?status=${status}` : `${API_BASE_URL}/trips`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return filterFallbackTrips(status);
    }

    const json = await response.json();
    const list = json?.data?.trips || json?.data || (Array.isArray(json) ? json : null);

    if (Array.isArray(list) && list.length > 0) {
      return list.map(normalizeTrip);
    }

    return filterFallbackTrips(status);
  } catch {
    return filterFallbackTrips(status);
  }
};

/**
 * Fetch all active trips on the road.
 */
export const getActiveTrips = async (): Promise<Trip[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/trips/active`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return FALLBACK_TRIPS.filter((t) => t.status === 'ACTIVE');
    }

    const json = await response.json();
    const list = json?.data?.trips || json?.data || (Array.isArray(json) ? json : null);

    if (Array.isArray(list) && list.length > 0) {
      return list.map(normalizeTrip);
    }

    return FALLBACK_TRIPS.filter((t) => t.status === 'ACTIVE');
  } catch {
    return FALLBACK_TRIPS.filter((t) => t.status === 'ACTIVE');
  }
};

/**
 * Fetch specific trip by ID.
 */
export const getTripById = async (id: string): Promise<Trip> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/trips/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const fallback = FALLBACK_TRIPS.find((t) => t.id === id) || FALLBACK_TRIPS[0];
      return fallback;
    }

    const json = await response.json();
    const tripData = json?.data?.trip || json?.data || json;

    if (tripData && tripData.id) {
      return normalizeTrip(tripData);
    }

    return FALLBACK_TRIPS.find((t) => t.id === id) || FALLBACK_TRIPS[0];
  } catch {
    return FALLBACK_TRIPS.find((t) => t.id === id) || FALLBACK_TRIPS[0];
  }
};

function filterFallbackTrips(status?: TripStatus): Trip[] {
  if (!status) return FALLBACK_TRIPS;
  return FALLBACK_TRIPS.filter((t) => t.status === status);
}
