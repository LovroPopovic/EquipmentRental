import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { authService } from './src/services/AuthService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userInfo = await authService.getUserInfo();
        if (userInfo?.rawRoles?.includes('student')) {
          setUserRole('student');
        } else if (userInfo?.rawRoles?.some(role => ['djelatnik', 'nastavnik', 'admin'].includes(role))) {
          setUserRole('staff');
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserRole(null);
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
        userRole={userRole}
        onAuthChange={checkAuthStatus}
      />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
