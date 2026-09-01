import { Platform } from "react-native";

export const BASE_URL = Platform.select({
  android: 'http://192.168.1.242:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

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


}

