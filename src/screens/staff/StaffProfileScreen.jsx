import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/AuthService';
import { apiService } from '../../services/ApiService';

const ProfileItem = ({ icon, title, subtitle, onPress, colors }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center p-4 rounded-xl mb-3"
    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
  >
    <View
      className="w-10 h-10 rounded-full items-center justify-center mr-4"
      style={{ backgroundColor: colors.primary }}
    >
      <Ionicons name={icon} size={20} color="white" />
    </View>
    <View className="flex-1">
      <Text className="font-semibold" style={{ color: colors.text }}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          {subtitle}
        </Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

const StatItem = ({ title, value, colors }) => (
  <View
    className="flex-1 p-4 rounded-xl mx-1"
    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
  >
    <Text className="text-2xl font-bold text-center mb-1" style={{ color: colors.text }}>
      {value}
    </Text>
    <Text className="text-xs text-center" style={{ color: colors.textSecondary }}>
      {title}
    </Text>
  </View>
);

const StaffProfileScreen = ({ navigation }) => {
  const colors = useColors();
  const { theme, toggleTheme, isDark } = useTheme();
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeBookings: 0,
    totalStudents: 0,
    pendingRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // Load user info
      const info = await authService.getUserInfo();
      setUserInfo(info?.backendUser || info);

      // Load dashboard stats for profile
      const statsResponse = await apiService.getDashboardStats();
      const dashboardStats = statsResponse.data || {};

      setStats({
        totalEquipment: dashboardStats.equipment?.total || 0,
        activeBookings: dashboardStats.bookings?.active || 0,
        totalStudents: dashboardStats.users?.students || 0,
        pendingRequests: dashboardStats.bookings?.pending || 0
      });

    } catch (error) {
      console.error('Error loading staff profile data:', error);
      setStats({
        totalEquipment: 0,
        activeBookings: 0,
        totalStudents: 0,
        pendingRequests: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Odjava',
      'Jeste li sigurni da se želite odjaviti?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Odjavi se',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Profil
          </Text>
          <TouchableOpacity
            onPress={handleLogout}
            className="p-2"
          >
            <Ionicons name="log-out" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View
          className="mx-4 mb-6 p-4 rounded-lg"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {userInfo?.firstName?.charAt(0) || userInfo?.displayName?.charAt(0) || 'S'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>
                {userInfo?.firstName && userInfo?.lastName
                  ? `${userInfo.firstName} ${userInfo.lastName}`
                  : userInfo?.displayName || 'Staff Member'}
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                {userInfo?.email || 'staff@apu.hr'}
              </Text>
              <View
                className="px-2 py-1 rounded-full self-start"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white text-xs font-medium">
                  Osoblje
                </Text>
              </View>
            </View>
          </View>

          {userInfo && (
            <View className="pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  Uloga:
                </Text>
                <Text className="text-sm font-medium" style={{ color: colors.text }}>
                  {userInfo?.role || 'Osoblje'}
                </Text>
              </View>
              {userInfo?.createdAt && (
                <View className="flex-row justify-between">
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    Član od:
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>
                    {formatDate(userInfo.createdAt)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View
          className="mx-4 mb-6 p-4 rounded-lg"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Postavke
          </Text>

          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 12 }}
              />
              <Text className="text-base" style={{ color: colors.text }}>
                Tamna tema
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={isDark ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Statistics */}
        {isLoading ? (
          <View className="mx-4 mb-6 p-4 rounded-lg items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
              Učitavam statistike...
            </Text>
          </View>
        ) : (
          <View
            className="mx-4 mb-6 p-4 rounded-lg"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Statistike
            </Text>
            <View className="flex-row justify-around mb-4">
              <View className="items-center">
                <Text className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>
                  {stats.totalEquipment}
                </Text>
                <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                  Ukupno{'\n'}opreme
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold mb-1" style={{ color: colors.warning }}>
                  {stats.pendingRequests}
                </Text>
                <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                  Zahtjevi za{'\n'}odobrenje
                </Text>
              </View>
            </View>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold mb-1" style={{ color: colors.success }}>
                  {stats.activeBookings}
                </Text>
                <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                  Aktivnih{'\n'}posudbi
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold mb-1" style={{ color: '#8b5cf6' }}>
                  {stats.totalStudents}
                </Text>
                <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                  Ukupno{'\n'}studenata
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffProfileScreen;