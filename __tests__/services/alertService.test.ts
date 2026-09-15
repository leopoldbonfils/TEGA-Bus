import { getAlerts, Alert } from '../../services/alertService';
import { API_BASE_URL } from '../../constants/config';

describe('alertService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAlerts', () => {
    it('sends Authorization bearer token and returns alerts list on success', async () => {
      const mockAlerts: Alert[] = [
        {
          id: 'alert-1',
          title: 'Route 101 Delay',
          message: 'Heavy traffic at Downtown',
          type: 'DELAY',
          routeId: 'route-101',
          createdAt: '2026-09-13T12:00:00Z',
          updatedAt: '2026-09-13T12:00:00Z',
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { alerts: mockAlerts },
        }),
      });

      const token = 'my-auth-token-123';
      const result = await getAlerts(token, 20);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/alerts?limit=20`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(result).toEqual(mockAlerts);
    });

    it('uses default limit of 50 if limit is not provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { alerts: [] },
        }),
      });

      await getAlerts('token-xyz');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/alerts?limit=50`,
        expect.anything()
      );
    });

    it('throws error with message from server when response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized access' }),
      });

      await expect(getAlerts('bad-token')).rejects.toThrow('Unauthorized access');
    });

    it('throws default status error message if server does not return a message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(getAlerts('token')).rejects.toThrow('Failed to load alerts (500)');
    });

    it('throws timed out message if request is aborted', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      global.fetch = jest.fn().mockRejectedValue(abortError);

      await expect(getAlerts('token')).rejects.toThrow(
        'Request timed out — could not load alerts'
      );
    });
  });
});
