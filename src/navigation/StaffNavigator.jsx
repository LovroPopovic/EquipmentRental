import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';

// Staff screens - to be created
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StudentManagementScreen from '../screens/staff/StudentManagementScreen';
import EquipmentManagementScreen from '../screens/staff/EquipmentManagementScreen';
import EquipmentHistoryScreen from '../screens/staff/EquipmentHistoryScreen';
import StaffProfileScreen from '../screens/staff/StaffProfileScreen';
import QRScannerScreen from '../screens/staff/QRScannerScreen';
import AddStaffEquipmentScreen from '../screens/staff/AddStaffEquipmentScreen';
import EquipmentDetailScreen from '../screens/main/EquipmentDetailScreen';
import BorrowingDetailScreen from '../screens/staff/BorrowingDetailScreen';
import ChatScreen from '../screens/common/ChatScreen';
import StaffMessagesListScreen from '../screens/staff/StaffMessagesListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigators for each tab
const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="EquipmentHistory" component={EquipmentHistoryScreen} />
      <Stack.Screen name="BorrowingDetail" component={BorrowingDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

const StudentsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentManagement" component={StudentManagementScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

const EquipmentStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EquipmentManagement" component={EquipmentManagementScreen} />
      <Stack.Screen name="EquipmentDetail" component={EquipmentDetailScreen} />
      <Stack.Screen
        name="AddStaffEquipment"
        component={AddStaffEquipmentScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};

const MessagesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StaffMessagesList" component={StaffMessagesListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StaffProfile" component={StaffProfileScreen} />
    </Stack.Navigator>
  );
};

const StaffNavigator = () => {
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Students':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Equipment':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ tabBarLabel: 'Nadzorna ploča' }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsStack}
        options={{ tabBarLabel: 'Studenti' }}
      />
      <Tab.Screen
        name="Equipment"
        component={EquipmentStack}
        options={{ tabBarLabel: 'Oprema' }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{ tabBarLabel: 'Poruke' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default StaffNavigator;