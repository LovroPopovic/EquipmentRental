import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import HomeScreen from '../screens/student/HomeScreen';
import SearchScreen from '../screens/student/SearchScreen';
import BookingsScreen from '../screens/student/BookingsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import EquipmentDetailScreen from '../screens/student/EquipmentDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StudentTabNavigator = () => {
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Početna',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Pretraži',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Rezervacije',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const StudentNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
      <Stack.Screen 
        name="EquipmentDetail" 
        component={EquipmentDetailScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};

export default StudentNavigator;