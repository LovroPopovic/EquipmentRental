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
import { mockEquipment } from '../../data/mockData';
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
    totalStudents: 0
  });

  const [recentActivity] = useState([
    {
      id: 1,
      equipment: 'Canon EOS R5',
      student: 'Ana Marić',
      type: 'borrowed',
      date: '2 sata'
    },
    {
      id: 2,
      equipment: 'MacBook Pro 16"',
      student: 'Petar Novak',
      type: 'returned',
      date: '4 sata'
    },
    {
      id: 3,
      equipment: 'Sony A7 III',
      student: 'Marija Kovač',
      type: 'borrowed',
      date: '1 dan'
    }
  ]);

  useEffect(() => {
    loadUserInfo();
    calculateStats();
  }, []);

  const loadUserInfo = async () => {
    try {
      const info = await authService.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const calculateStats = () => {
    const total = mockEquipment.length;
    const available = mockEquipment.filter(eq => eq.available).length;
    const borrowed = total - available;

    setStats({
      totalEquipment: total,
      availableEquipment: available,
      borrowedEquipment: borrowed,
      totalStudents: 25 // Mock value
    });
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
        <TouchableOpacity
          onPress={() => navigation.navigate('QRScanner')}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name="qr-code" size={24} color="white" />
        </TouchableOpacity>
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
              title="Studenti"
              value={stats.totalStudents}
              icon="people"
              color="#8b5cf6"
              onPress={() => navigation.navigate('Students', {
                screen: 'StudentManagement'
              })}
            />
          </View>
        </View>

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