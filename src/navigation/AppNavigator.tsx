import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useTheme } from '../context/ThemeContext';
import { useColors } from '../hooks/useColors';
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import StaffNavigator from './StaffNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  isAuthenticated: boolean;
  userRole: 'student' | 'staff' | null;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ isAuthenticated, userRole }) => {
  const { isDark } = useTheme();
  const colors = useColors();

  const theme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900' as '900',
      },
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userRole === 'student' ? (
          <Stack.Screen name="StudentApp" component={StudentNavigator} />
        ) : (
          <Stack.Screen name="StaffApp" component={StaffNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;