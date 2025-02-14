// utils/sessionManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export const getSessionUser = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};