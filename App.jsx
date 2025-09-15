import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { authService } from './src/services/AuthService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();

    // Set up a periodic check for auth state changes (e.g., after logout)
    const authInterval = setInterval(async () => {
      const currentAuth = await authService.isAuthenticated();
      if (currentAuth !== isAuthenticated) {
        checkAuthStatus();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(authInterval);
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // or a loading screen
  }

  return (
    <ThemeProvider>
      <AppNavigator
        isAuthenticated={isAuthenticated}
        onAuthChange={checkAuthStatus}
      />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
