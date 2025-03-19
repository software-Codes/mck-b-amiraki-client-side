// src/context/GlobalContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName, useColorScheme, Text } from 'react-native';

interface AppSettings {
  language: string;
  notifications: boolean;
  fontSize: 'small' | 'medium' | 'large';
  // Add more settings as needed
}

interface GlobalContextType {
  // Theme
  theme: ColorSchemeName;
  toggleTheme: () => Promise<void>;
  
  // Network Status
  isOnline: boolean;
  connectionType: string | null;
  
  // App Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  
  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Global Modal
  showModal: (content: React.ReactNode | string) => void;
  closeModal: () => void;
  isModalVisible: boolean;
  modalContent: React.ReactNode | null;
  
  // Global Error Handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultSettings: AppSettings = {
  language: 'en',
  notifications: true,
  fontSize: 'medium',
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ColorSchemeName>(systemColorScheme);
  
  // Network Status State
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  
  // App Settings State
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  
  // Error State
  const [error, setError] = useState<string | null>(null);

  // Initialize settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('appSettings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
        
        // Load saved theme preference
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as ColorSchemeName);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Network connectivity monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, []);

  // Theme toggling
  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Settings update
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  // Modal handlers
  const showModal = (content: React.ReactNode | string) => {
    // Handle both string messages and React components
    setModalContent(typeof content === 'string' ? <Text>{content}</Text> : content);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => setModalContent(null), 300); // Clear content after animation completes
  };

  // Error handlers
  const clearError = () => setError(null);

  const value = {
    theme,
    toggleTheme,
    isOnline,
    connectionType,
    settings,
    updateSettings,
    isLoading,
    setIsLoading,
    showModal,
    closeModal,
    isModalVisible,
    modalContent,
    error,
    setError,
    clearError,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

// Custom hooks for specific global features
export const useTheme = () => {
  const { theme, toggleTheme } = useGlobal();
  return { theme, toggleTheme };
};

export const useNetworkStatus = () => {
  const { isOnline, connectionType } = useGlobal();
  return { isOnline, connectionType };
};

export const useAppSettings = () => {
  const { settings, updateSettings } = useGlobal();
  return { settings, updateSettings };
};

export const useGlobalModal = () => {
  const { showModal, closeModal, isModalVisible, modalContent } = useGlobal();
  return { showModal, closeModal, isModalVisible, modalContent };
};

export const useGlobalError = () => {
  const { error, setError, clearError } = useGlobal();
  return { error, setError, clearError };
};