import { getNearbyStops, getActiveBuses, getNearbyBusesForDestination, getNearbyBuses, getBusDetails, getUpcomingTrip, NearbyStop, ActiveBus, RecommendedBus, UpcomingTrip } from '../../services/busService';
import { API_BASE_URL } from '../../constants/config';

describe('busService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNearbyStops', () => {
    it('fetches nearby stops using latitude and longitude query params', async () => {
      const mockStops: NearbyStop[] = [
        { id: 'stop-1', name: 'Downtown Station', latitude: -1.95, longitude: 30.058, distanceMeters: 120 },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStops }),
      });

      const stops = await getNearbyStops(-1.95, 30.058);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/stops/nearby?latitude=-1.95&longitude=30.058`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(stops).toEqual(mockStops);
    });

    it('handles raw array responses from the backend', async () => {
      const mockStops = [
        { id: 'stop-2', name: 'Nyabugogo Park', latitude: -1.93, longitude: 30.05, distanceMeters: 250 },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockStops,
      });

      const stops = await getNearbyStops(-1.93, 30.05);
      expect(stops).toEqual(mockStops);
    });

    it('returns empty array when response data is neither wrapped nor an array', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: null }),
      });

      const stops = await getNearbyStops(-1.95, 30.058);
      expect(stops).toEqual([]);
    });

    it('throws error when the server response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getNearbyStops(-1.95, 30.058)).rejects.toThrow('Failed to load nearby stops');
    });

    it('throws timeout error when request is aborted', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      global.fetch = jest.fn().mockRejectedValue(abortError);

      await expect(getNearbyStops(-1.95, 30.058)).rejects.toThrow('Server connection timed out');
    });
  });

  describe('getActiveBuses', () => {
    it('fetches active buses successfully with standard { success, data: [...] } format', async () => {
      const mockBuses: ActiveBus[] = [
        { id: 'bus-1', busNumber: 'RAC 123 A', status: 'IN_TRANSIT', speed: 45 },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockBuses }),
      });

      const buses = await getActiveBuses();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/buses/active`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(buses).toEqual(mockBuses);
    });

    it('handles nested { data: { buses: [...] } } format', async () => {
      const mockBuses = [{ id: 'bus-2', busNumber: 'RAC 456 B', status: 'SCHEDULED' }];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { buses: mockBuses } }),
      });

      const buses = await getActiveBuses();
      expect(buses).toEqual(mockBuses);
    });

    it('throws error when active buses request fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 502,
      });

      await expect(getActiveBuses()).rejects.toThrow('Failed to load active buses');
    });

    it('throws timeout error on AbortError', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      global.fetch = jest.fn().mockRejectedValue(abortError);

      await expect(getActiveBuses()).rejects.toThrow('Server connection timed out');
    });
  });

  describe('getNearbyBusesForDestination', () => {
    it('queries without destination parameter when destination is not provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await getNearbyBusesForDestination(-1.95, 30.058);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/buses/nearby?latitude=-1.95&longitude=30.058`,
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('appends encoded destination to url when destination is provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await getNearbyBusesForDestination(-1.95, 30.058, 'Kimironko Market');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/buses/nearby?latitude=-1.95&longitude=30.058&destination=Kimironko%20Market`,
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('throws error when fetch fails with non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(getNearbyBusesForDestination(-1.95, 30.058)).rejects.toThrow('Failed to find buses');
    });

    it('handles AbortError timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      global.fetch = jest.fn().mockRejectedValue(abortError);

      await expect(getNearbyBusesForDestination(-1.95, 30.058)).rejects.toThrow('Server connection timed out');
    });
  });

  describe('getNearbyBuses', () => {
    it('delegates to getNearbyBusesForDestination without destination parameter', async () => {
      const mockBuses = [{ id: 'bus-1', busNumber: 'RAC 123 A' }];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockBuses }),
      });

      const buses = await getNearbyBuses(-1.95, 30.058);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/buses/nearby?latitude=-1.95&longitude=30.058`,
        expect.anything()
      );
      expect(buses).toEqual(mockBuses);
    });
  });

  describe('getBusDetails', () => {
    const mockBus: RecommendedBus = {
      id: 'target-bus-1',
      busNumber: 'RAC 101 A',
      plateNumber: 'RAC 101 A',
      driverName: 'Claude',
      routeName: 'Downtown - Remera',
      routeNumber: '101',
      latitude: -1.95,
      longitude: 30.058,
      speed: 30,
      heading: 90,
      currentStop: 'Downtown',
      nextStop: 'Rwandex',
      distanceKm: 1.2,
      distanceMeters: 1200,
      etaMinutes: 5,
      status: 'On Route',
      isApproaching: true,
    };

    it('returns the matching bus when found by ID in nearby buses', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [mockBus] }),
      });

      const result = await getBusDetails(-1.95, 30.058, 'target-bus-1');
      expect(result).toEqual(mockBus);
    });

    it('throws error when the bus with specified ID is not found', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [mockBus] }),
      });

      await expect(getBusDetails(-1.95, 30.058, 'non-existent-bus-id')).rejects.toThrow(
        'Bus details are no longer available'
      );
    });
  });

  describe('getUpcomingTrip', () => {
    it('returns upcoming trip data when response is successful', async () => {
      const mockTrip: UpcomingTrip = {
        id: 'trip-101',
        routeNumber: '101',
        routeName: 'Downtown - Nyabugogo',
        destination: 'Nyabugogo',
        time: '14:30',
        etaMinutes: 10,
        status: 'Arriving',
        statusLabel: 'Arriving Soon',
        busNumber: 'RAC 789 C',
        plateNumber: 'RAC 789 C',
        driverName: 'Eric',
        currentStop: 'Downtown',
        nextStop: 'Kigali City',
        isMoving: true,
        speed: 35,
        distanceMeters: 800,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockTrip }),
      });

      const trip = await getUpcomingTrip(-1.95, 30.058);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/buses/upcoming-trip?latitude=-1.95&longitude=30.058`,
        expect.anything()
      );
      expect(trip).toEqual(mockTrip);
    });

    it('returns null when response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const trip = await getUpcomingTrip(-1.95, 30.058);
      expect(trip).toBeNull();
    });

    it('returns null when fetch throws a network or timeout error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const trip = await getUpcomingTrip(-1.95, 30.058);
      expect(trip).toBeNull();
    });
  });
});
