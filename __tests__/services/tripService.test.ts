import {
  getAllTrips,
  getActiveTrips,
  getTripById,
  FALLBACK_TRIPS,
  Trip,
} from '../../services/tripService';
import { API_BASE_URL } from '../../constants/config';

describe('tripService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTrips', () => {
    it('returns trips from backend when API returns { success: true, data: { trips: [...] } }', async () => {
      const mockTrips: any[] = [
        {
          id: 'test-trip-1',
          busId: 'bus-1',
          driverId: 'drv-1',
          routeId: 'route-1',
          status: 'SCHEDULED',
          route: {
            id: 'route-1',
            name: 'Route 1',
            startLocation: 'Kigali',
            destination: 'Nyabugogo',
            fare: 500,
            estimatedDuration: 30,
            stops: [],
          },
          bus: {
            id: 'bus-1',
            busNumber: '101',
            plateNumber: 'RAB 101 A',
          },
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { trips: mockTrips },
        }),
      });

      const trips = await getAllTrips();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/trips`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(trips.length).toBe(1);
      expect(trips[0].id).toBe('test-trip-1');
      expect(trips[0].bus.busNumber).toBe('101');
    });

    it('appends ?status= filter when status parameter is passed', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { trips: [] },
        }),
      });

      await getAllTrips('ACTIVE');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/trips?status=ACTIVE`,
        expect.anything()
      );
    });

    it('returns filtered fallback trips when API returns non-ok status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const scheduledTrips = await getAllTrips('SCHEDULED');
      expect(scheduledTrips.length).toBeGreaterThan(0);
      scheduledTrips.forEach((t) => expect(t.status).toBe('SCHEDULED'));
    });

    it('returns filtered fallback trips when fetch throws network error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const activeTrips = await getAllTrips('ACTIVE');
      expect(activeTrips.length).toBeGreaterThan(0);
      activeTrips.forEach((t) => expect(t.status).toBe('ACTIVE'));
    });
  });

  describe('getActiveTrips', () => {
    it('fetches from /trips/active', async () => {
      const mockActive = [
        {
          id: 'act-1',
          busId: 'b-1',
          driverId: 'd-1',
          routeId: 'r-1',
          status: 'ACTIVE',
          route: { id: 'r-1', name: 'Route 10', startLocation: 'A', destination: 'B', fare: 300, estimatedDuration: 20 },
          bus: { id: 'b-1', busNumber: '500', plateNumber: 'RAD 500 A', locations: [{ speed: 35, latitude: -1.9, longitude: 30.0 }] },
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { trips: mockActive },
        }),
      });

      const trips = await getActiveTrips();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/trips/active`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(trips.length).toBe(1);
      expect(trips[0].speed).toBe(35);
    });

    it('returns active fallback trips when fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Timeout'));

      const trips = await getActiveTrips();
      expect(trips.length).toBeGreaterThan(0);
      trips.forEach((t) => expect(t.status).toBe('ACTIVE'));
    });
  });

  describe('getTripById', () => {
    it('fetches trip by id from /trips/:id', async () => {
      const mockTrip = {
        id: 'trip-999',
        busId: 'b-999',
        driverId: 'd-999',
        routeId: 'r-999',
        status: 'ACTIVE',
        route: { id: 'r-999', name: 'Special Route', startLocation: 'Alpha', destination: 'Beta', fare: 600, estimatedDuration: 25 },
        bus: { id: 'b-999', busNumber: '999', plateNumber: 'RAD 999 Z' },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { trip: mockTrip },
        }),
      });

      const trip = await getTripById('trip-999');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/trips/trip-999`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(trip.id).toBe('trip-999');
      expect(trip.route.name).toBe('Special Route');
    });

    it('returns fallback trip if fetch throws or fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network offline'));

      const trip = await getTripById('trip-up-1');
      expect(trip.id).toBe('trip-up-1');
      expect(trip.route.startLocation).toBe('Nyabugogo');
    });
  });
});
