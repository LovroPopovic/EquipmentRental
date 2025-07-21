import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isAuthenticated] = useState(false);
  const [userRole] = useState<'student' | 'staff' | null>(null);

  return (
    <ThemeProvider>
      <AppNavigator isAuthenticated={isAuthenticated} userRole={userRole} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
