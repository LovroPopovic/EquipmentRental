import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { authService } from '../../services/AuthService';

const ProfileScreen = ({ navigation }) => {
  const colors = useColors();

  // Mock user data (would come from auth service)
  const [user] = useState({
    name: 'Ana Korisnik',
    email: 'ana.korisnik@apu.hr',
    userId: '2021001234',
    department: 'Digitalni dizajn',
    joinDate: '2021-09-15'
  });

  // Mock reservation history
  const [reservations] = useState([
    {
      id: 1,
      equipmentName: 'Wacom CTL-472',
      category: 'Tableti',
      startDate: '2024-09-15',
      endDate: '2024-09-20',
      status: 'active', // active, completed, cancelled
      owner: 'Prof. Ivo Kovač',
      location: 'Grafička sala'
    },
    {
      id: 2,
      equipmentName: 'Canon EOS 2000D',
      category: 'Kamere',
      startDate: '2024-09-10',
      endDate: '2024-09-14',
      status: 'completed',
      owner: 'Prof. Tomislav Babić',
      location: 'Studio A'
    },
    {
      id: 3,
      equipmentName: 'Nikon D5600',
      category: 'Kamere',
      startDate: '2024-09-05',
      endDate: '2024-09-08',
      status: 'completed',
      owner: null, // University equipment
      location: 'Studio B'
    },
    {
      id: 4,
      equipmentName: 'MacBook Pro',
      category: 'Računala',
      startDate: '2024-08-28',
      endDate: '2024-09-01',
      status: 'cancelled',
      owner: 'Prof. Sandra Miletić',
      location: 'IT sala'
    }
  ]);

  const handleLogout = async () => {
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
              // App.jsx will automatically detect the auth state change and redirect to login
              Alert.alert('Uspjeh', 'Uspješno ste odjavljeni.');
            } catch (error) {
              Alert.alert('Greška', 'Došlo je do greške prilikom odjave.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'completed':
        return colors.textSecondary;
      case 'cancelled':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktivno';
      case 'completed':
        return 'Završeno';
      case 'cancelled':
        return 'Otkazano';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderReservationItem = ({ item }) => (
    <View
      className="p-4 mb-3 rounded-lg"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold mb-1" style={{ color: colors.text }}>
            {item.equipmentName}
          </Text>
          <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
            {item.category} • {item.location}
          </Text>
        </View>
        <View
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: getStatusColor(item.status) + '20' }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: getStatusColor(item.status) }}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
          {item.owner && (
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Vlasnik: {item.owner}
            </Text>
          )}
        </View>
        <Ionicons
          name={
            item.category === 'Kamere' ? 'camera' :
            item.category === 'Stativni' ? 'camera-outline' :
            item.category === 'Tableti' ? 'tablet-portrait' :
            item.category === 'Studijski' ? 'business' :
            item.category === 'Računala' ? 'laptop' :
            'hardware-chip'
          }
          size={24}
          color={colors.textSecondary}
        />
      </View>
    </View>
  );

  const activeReservations = reservations.filter(r => r.status === 'active');
  const reservationHistory = reservations.filter(r => r.status !== 'active');

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
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>
                {user.name}
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                {user.email}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {user.userId}
              </Text>
            </View>
          </View>

          <View className="pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Odsjek:
              </Text>
              <Text className="text-sm font-medium" style={{ color: colors.text }}>
                {user.department}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Član od:
              </Text>
              <Text className="text-sm font-medium" style={{ color: colors.text }}>
                {formatDate(user.joinDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Active Reservations */}
        {activeReservations.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 px-4" style={{ color: colors.text }}>
              Aktivne rezervacije ({activeReservations.length})
            </Text>
            <View className="px-4">
              {activeReservations.map(item => (
                <View key={item.id}>
                  {renderReservationItem({ item })}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reservation History */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3 px-4" style={{ color: colors.text }}>
            Rezervacije - povijest ({reservationHistory.length})
          </Text>
          {reservationHistory.length > 0 ? (
            <View className="px-4">
              {reservationHistory.map(item => (
                <View key={item.id}>
                  {renderReservationItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-8 px-4">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
              </View>
              <Text
                className="text-base font-medium mb-2 text-center"
                style={{ color: colors.text }}
              >
                Nema povijesti rezervacija
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: colors.textSecondary }}
              >
                Vaše rezervacije će se prikazati ovdje kada završe.
              </Text>
            </View>
          )}
        </View>

        {/* Statistics */}
        <View
          className="mx-4 mb-6 p-4 rounded-lg"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Statistike
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>
                {reservations.length}
              </Text>
              <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                Ukupno{'\n'}rezervacija
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold mb-1" style={{ color: colors.success }}>
                {reservations.filter(r => r.status === 'completed').length}
              </Text>
              <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                Završenih{'\n'}rezervacija
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold mb-1" style={{ color: colors.warning }}>
                {reservations.filter(r => r.status === 'active').length}
              </Text>
              <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                Aktivnih{'\n'}rezervacija
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;