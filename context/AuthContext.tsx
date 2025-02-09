import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "user" | "admin";
  status: string;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("userToken");
      if (storedToken) {
        // Set axios default header
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;

        // Verify token and get user data
        const response = await axios.get("'https://nodebackend.salmontree-886fdcec.westus2.azurecontainerapps.io/auth/verify");
        setUser(response.data.user);
        setToken(storedToken);
        return true;
      }
      return false;
    } catch (error) {
      await signOut();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await axios.post("'https://nodebackend.salmontree-886fdcec.westus2.azurecontainerapps.io/api/auth/login", {
        email,
        password,
      });

      const { user, token } = response.data;

      // Store token
      await AsyncStorage.setItem("userToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      setToken(token);
    } catch (error) {
      throw error;
    }
  };
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signOut, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (undefined === context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
