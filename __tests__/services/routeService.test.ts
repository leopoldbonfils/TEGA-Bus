import { getAllRoutes, searchRoutes, FALLBACK_ROUTES, BusRoute } from '../../services/routeService';
import { API_BASE_URL } from '../../constants/config';

describe('routeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRoutes', () => {
    it('returns routes from backend when API returns { success: true, data: { routes: [...] } }', async () => {
      const mockRoutes: BusRoute[] = [
        {
          id: 'route-301',
          name: '301',
          startLocation: 'Kigali',
          destination: 'Rubavu',
          fare: 3500,
          estimatedDuration: 180,
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { routes: mockRoutes },
        }),
      });

      const routes = await getAllRoutes();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/routes`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(routes).toEqual(mockRoutes);
    });

    it('returns routes when backend response structure has data as array { data: [...] }', async () => {
      const mockRoutes: BusRoute[] = [
        {
          id: 'route-401',
          name: '401',
          startLocation: 'Remera',
          destination: 'Kanombe',
          fare: 400,
          estimatedDuration: 20,
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: mockRoutes,
        }),
      });

      const routes = await getAllRoutes();
      expect(routes).toEqual(mockRoutes);
    });

    it('returns FALLBACK_ROUTES if API responds with non-ok status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const routes = await getAllRoutes();
      expect(routes).toEqual(FALLBACK_ROUTES);
    });

    it('returns FALLBACK_ROUTES if fetch throws an error (offline / network error)', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

      const routes = await getAllRoutes();
      expect(routes).toEqual(FALLBACK_ROUTES);
    });
  });

  describe('searchRoutes', () => {
    it('searches routes with both from and to parameters', async () => {
      const mockRoutes: BusRoute[] = [
        {
          id: 'route-101',
          name: '101',
          startLocation: 'Downtown',
          destination: 'Nyabugogo',
          fare: 500,
          estimatedDuration: 25,
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { routes: mockRoutes },
        }),
      });

      const results = await searchRoutes('Downtown', 'Nyabugogo');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/routes/search?from=Downtown&to=Nyabugogo`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(results).toEqual(mockRoutes);
    });

    it('searches routes with only destination (to parameter)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { routes: [] },
        }),
      });

      await searchRoutes(undefined, 'Kimironko');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/routes/search?to=Kimironko`,
        expect.anything()
      );
    });

    it('returns empty array if search request fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const results = await searchRoutes('UnknownStart', 'UnknownDest');
      expect(results).toEqual([]);
    });

    it('returns empty array if network error occurs during search', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const results = await searchRoutes('A', 'B');
      expect(results).toEqual([]);
    });
  });
});
