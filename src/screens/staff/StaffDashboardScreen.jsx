import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';
import StatCard from '../../components/cards/StatCard';
import ActivityCard from '../../components/cards/ActivityCard';
import Header from '../../components/common/Header';



const StaffDashboardScreen = ({ navigation }) => {
  const colors = useColors();
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    borrowedEquipment: 0,
    totalStudents: 0,
    pendingRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load user info
      const info = await authService.getUserInfo();
      setUserInfo(info?.backendUser || info);

      // Load dashboard stats
      console.log('🔄 Loading dashboard stats...');
      const statsResponse = await apiService.getDashboardStats();
      const dashboardStats = statsResponse.data || {};

      setStats({
        totalEquipment: dashboardStats.equipment?.total || 0,
        availableEquipment: dashboardStats.equipment?.available || 0,
        borrowedEquipment: dashboardStats.equipment?.borrowed || 0,
        totalStudents: dashboardStats.users?.students || 0,
        pendingRequests: dashboardStats.bookings?.pending || 0
      });

      // Load recent activity
      console.log('🔄 Loading recent activity...');
      const activityResponse = await apiService.getRecentActivity();
      const activityData = activityResponse.data || [];

      setRecentActivity(activityData);

      // Load pending requests
      console.log('🔄 Loading pending requests...');
      const pendingResponse = await apiService.getBookings({ status: 'PENDING', limit: 5 });
      const pendingData = pendingResponse.data || [];

      console.log('🔍 Pending requests data:', pendingData);
      setPendingRequests(pendingData);
      console.log('📊 Dashboard data loaded successfully');

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);

      // No fallback - show error state
      setRecentActivity([]);
      setPendingRequests([]);
      setStats({
        totalEquipment: 0,
        availableEquipment: 0,
        borrowedEquipment: 0,
        totalStudents: 0,
        pendingRequests: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityPress = (activity) => {
    // Navigate to EquipmentHistory with more details about this activity
    navigation.navigate('EquipmentHistory', { highlightActivity: activity.id });
  };

  const renderActivityItem = ({ item }) => (
    <ActivityCard activity={item} onPress={handleActivityPress} variant="compact" />
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      <Header
        title="Nadzorna ploča"
        subtitle={`Dobrodošli, ${userInfo?.firstName || 'Staff'}`}
      >
        {/* QR Scanner button - DISABLED */}
        {/*
        <TouchableOpacity
          onPress={() => navigation.navigate('QRScanner')}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name="qr-code" size={24} color="white" />
        </TouchableOpacity>
        */}
      </Header>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Pregled
          </Text>

          <View className="flex-row">
            <StatCard
              title="Ukupna oprema"
              value={stats.totalEquipment}
              icon="construct"
              color="#3b82f6"
              onPress={() => navigation.navigate('Equipment', {
                screen: 'EquipmentManagement',
                params: { filterStatus: 'all' }
              })}
            />
            <StatCard
              title="Dostupno"
              value={stats.availableEquipment}
              icon="checkmark-circle"
              color="#22c55e"
              onPress={() => navigation.navigate('Equipment', {
                screen: 'EquipmentManagement',
                params: { filterStatus: 'available' }
              })}
            />
          </View>

          <View className="flex-row">
            <StatCard
              title="Posuđeno"
              value={stats.borrowedEquipment}
              icon="time"
              color="#ef4444"
              onPress={() => navigation.navigate('Equipment', {
                screen: 'EquipmentManagement',
                params: { filterStatus: 'borrowed' }
              })}
            />
            <StatCard
              title="Zahtjevi"
              value={stats.pendingRequests}
              icon="hourglass"
              color="#f59e0b"
              onPress={() => navigation.navigate('EquipmentHistory', {
                initialFilter: 'pending'
              })}
            />
          </View>

          <View className="flex-row">
            <StatCard
              title="Studenti"
              value={stats.totalStudents}
              icon="people"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Students', {
                screen: 'StudentManagement'
              })}
            />
            <View className="flex-1 mr-2" />
          </View>
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View className="px-4 pb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                Zahtjevi za odobrenje
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('EquipmentHistory', { initialFilter: 'pending' })}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                  Prikaži sve ({stats.pendingRequests})
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={pendingRequests}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('BorrowingDetail', {
                    borrowing: {
                      id: item.id,
                      equipment: String(item.equipment?.name || 'Unknown Equipment'),
                      student: String(`${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || 'Unknown Student'),
                      status: 'pending',
                      borrowDate: String(item.startDate ? new Date(item.startDate).toLocaleDateString('hr-HR') : 'N/A'),
                      returnDate: null,
                      notes: item.notes || null
                    },
                    onRefresh: loadDashboardData
                  })}
                  className="p-4 rounded-xl mb-2"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: '#f59e0b' }}
                    >
                      <Ionicons name="hourglass" size={16} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold mb-1" style={{ color: colors.text }}>
                        {String(item.equipment?.name || 'Unknown Equipment')}
                      </Text>
                      <Text className="text-sm" style={{ color: colors.textSecondary }}>
                        {String(`${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || 'Unknown Student')}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {String(item.startDate ? new Date(item.startDate).toLocaleDateString('hr-HR') : 'N/A')}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#fffbeb' }}
                    >
                      <Text className="text-xs font-medium" style={{ color: '#d97706' }}>
                        Na čekanju
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Recent Activity */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              Nedavna aktivnost
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('EquipmentHistory')}>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                Prikaži sve
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentActivity}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffDashboardScreen;