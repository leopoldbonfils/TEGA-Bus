import { Platform } from "react-native";

export const BASE_URL = 'https://tega-bus-backend.onrender.com/api';

export interface RegisterPayLoad {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export const registerUser = async (Data: RegisterPayLoad) => {
  const response = await fetch(`${BASE_URL}/auth/register`,
    {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMessage = result.message || (result.errors && result.errors.length > 0 ? result.errors[0].message : 'Registration failed');
    throw new Error(errorMessage);
  }

  return result.data;
};

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginPayload) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result.message ||
      (result.errors && result.errors.length > 0 ? result.errors[0].message : 'Login failed');
    throw new Error(errorMessage);
  }

  return result.data;
};

