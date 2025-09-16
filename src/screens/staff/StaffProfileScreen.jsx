import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { authService } from '../../services/AuthService';

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
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const info = await authService.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Error loading user info:', error);
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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="px-6 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Profil
        </Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          Upravljanje računa
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View className="p-6">
          <View
            className="p-6 rounded-xl items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-2xl">
                {userInfo?.firstName?.charAt(0) || 'S'}
              </Text>
            </View>
            <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>
              {userInfo?.displayName || 'Staff Member'}
            </Text>
            <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
              {userInfo?.email || 'staff@apu.hr'}
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white text-xs font-medium">
                Osoblje
              </Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Statistike
          </Text>
          <View className="flex-row">
            <StatItem title="Aktivne posudbe" value="12" colors={colors} />
            <StatItem title="Ukupno opreme" value="45" colors={colors} />
            <StatItem title="Studenti" value="25" colors={colors} />
          </View>
        </View>

        {/* Settings */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Postavke
          </Text>


          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center p-4 rounded-xl"
            style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: '#dc2626' }}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold" style={{ color: '#dc2626' }}>
                Odjavi se
              </Text>
              <Text className="text-sm mt-1" style={{ color: '#b91c1c' }}>
                Završi svoju sesiju
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffProfileScreen;