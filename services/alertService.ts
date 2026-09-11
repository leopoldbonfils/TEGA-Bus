

import { API_BASE_URL } from '../constants/config';

export type AlertType =
  | 'GENERAL'
  | 'SERVICE_ALERT'
  | 'BUS_APPROACHING'
  | 'DELAY'
  | 'ROUTE_UPDATE';

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  routeId: string | null;
  createdAt: string;
  updatedAt: string;
  route?: {
    id: string;
    name: string;
  } | null;
}


export async function getAlerts(authToken: string, limit = 50): Promise<Alert[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/alerts?limit=${limit}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.message || `Failed to load alerts (${response.status})`);
    }

    const json = await response.json();

    // Backend wraps: { success: true, data: { alerts: [...] } }
    if (json?.success && Array.isArray(json?.data?.alerts)) {
      return json.data.alerts as Alert[];
    }

    return [];
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out — could not load alerts');
    }
    throw err;
  }
}
