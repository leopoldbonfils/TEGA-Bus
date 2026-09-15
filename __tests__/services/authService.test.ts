import { registerUser, loginUser, BASE_URL } from '../../services/authService';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('sends POST request to /auth/register and returns user data on success', async () => {
      const mockUserData = {
        id: 'user-1',
        name: 'John chirstophe',
        email: 'john@example.com',
        role: 'PASSENGER',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockUserData,
        }),
      });

      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await registerUser(payload);

      // Verify fetch was called with the correct endpoint, headers, and body
      expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(result).toEqual(mockUserData);
    });

    it('throws error with message from backend when registration fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: 'Email already in use',
        }),
      });

      const payload = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      await expect(registerUser(payload)).rejects.toThrow('Email already in use');
    });

    it('throws error with first validation error message if message is missing', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          errors: [{ message: 'Password must be at least 6 characters' }],
        }),
      });

      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      };

      await expect(registerUser(payload)).rejects.toThrow('Password must be at least 6 characters');
    });

    it('throws fallback "Registration failed" if backend returns no error message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await expect(registerUser(payload)).rejects.toThrow('Registration failed');
    });
  });

  describe('loginUser', () => {
    it('sends POST request to /auth/login and returns user data and token on success', async () => {
      const mockLoginResponse = {
        user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        token: 'fake-jwt-token',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockLoginResponse,
        }),
      });

      const credentials = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await loginUser(credentials);

      expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      expect(result).toEqual(mockLoginResponse);
    });

    it('throws error with message from backend when login credentials are invalid', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: 'Invalid email or password',
        }),
      });

      const credentials = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      await expect(loginUser(credentials)).rejects.toThrow('Invalid email or password');
    });

    it('throws fallback "Login failed" if backend returns no specific message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const credentials = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      await expect(loginUser(credentials)).rejects.toThrow('Login failed');
    });
  });
});
