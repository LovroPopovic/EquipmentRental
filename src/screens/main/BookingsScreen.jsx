import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const BookingsScreen = ({ navigation }) => {
  const colors = useColors();

  // Mock active bookings data
  const [activeBookings] = useState([
    {
      id: 1,
      equipmentName: 'Wacom CTL-472',
      category: 'Tableti',
      startDate: '2024-09-15',
      endDate: '2024-09-20',
      status: 'active',
      owner: {
        name: 'Prof. Ivo Kovač',
        email: 'ivo.kovac@apu.hr',
        role: 'profesor'
      },
      location: 'Grafička sala',
      pickupTime: '09:00',
      returnTime: '17:00',
      equipment: {
        id: 3,
        name: 'Wacom CTL-472',
        category: 'Tableti',
        description: 'Grafički tablet za digitalno crtanje, USB povezivanje',
        available: false,
        location: 'Grafička sala',
      }
    },
    {
      id: 2,
      equipmentName: 'Nikon D5600',
      category: 'Kamere',
      startDate: '2024-09-18',
      endDate: '2024-09-22',
      status: 'confirmed',
      owner: null, // University equipment
      location: 'Studio B',
      pickupTime: '10:00',
      returnTime: '16:00',
      equipment: {
        id: 4,
        name: 'Nikon D5600',
        category: 'Kamere',
        description: 'DSLR kamera s Wi-Fi, 24.2MP, okretni LCD ekran',
        available: false,
        location: 'Studio B',
      }
    },
    {
      id: 3,
      equipmentName: 'iPad Pro 12.9"',
      category: 'Tableti',
      startDate: '2024-09-25',
      endDate: '2024-09-28',
      status: 'pending',
      owner: null,
      location: 'Grafička sala',
      pickupTime: '14:00',
      returnTime: '18:00',
      equipment: {
        id: 8,
        name: 'iPad Pro 12.9"',
        category: 'Tableti',
        description: 'Profesionalni tablet za dizajn, s Apple Pencil podrškom',
        available: true,
        location: 'Grafička sala',
      }
    }
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'confirmed':
        return colors.primary;
      case 'pending':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktivno';
      case 'confirmed':
        return 'Potvrđeno';
      case 'pending':
        return 'Na čekanju';
      default:
        return status;
    }
  };

  const handleCancelBooking = (booking) => {
    Alert.alert(
      'Otkaži rezervaciju',
      `Jeste li sigurni da želite otkazati rezervaciju za ${booking.equipmentName}?`,
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Da, otkaži',
          style: 'destructive',
          onPress: () => {
            // Here would be the cancel booking logic
            Alert.alert('Uspjeh', 'Rezervacija je otkazana.');
          }
        }
      ]
    );
  };

  const handleContactOwner = (booking) => {
    if (booking.owner) {
      navigation.navigate('Message', {
        owner: booking.owner,
        equipment: booking.equipment
      });
    } else {
      Alert.alert('Informacije', 'Ovo je sveučilišna oprema. Kontaktirajte administratore za više informacija.');
    }
  };

  const renderBookingItem = ({ item }) => (
    <View
      className="p-4 mb-4 rounded-lg"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold mb-1" style={{ color: colors.text }}>
            {item.equipmentName}
          </Text>
          <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
            {item.category} • {item.location}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
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

      {/* Date Range */}
      <View
        className="p-3 mb-3 rounded-lg"
        style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
      >
        <View className="flex-row items-center justify-between">
          <View className="items-center">
            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
              Početak
            </Text>
            <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
              {formatDateShort(item.startDate)}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {item.pickupTime}
            </Text>
          </View>

          <View className="flex-1 items-center mx-4">
            <View
              className="w-full h-px mb-2"
              style={{ backgroundColor: colors.border }}
            />
            <Ionicons
              name={
                item.category === 'Kamere' ? 'camera' :
                item.category === 'Stativni' ? 'camera-outline' :
                item.category === 'Tableti' ? 'tablet-portrait' :
                item.category === 'Studijski' ? 'business' :
                item.category === 'Računala' ? 'laptop' :
                'hardware-chip'
              }
              size={20}
              color={colors.textSecondary}
            />
            <View
              className="w-full h-px mt-2"
              style={{ backgroundColor: colors.border }}
            />
          </View>

          <View className="items-center">
            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
              Završetak
            </Text>
            <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
              {formatDateShort(item.endDate)}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {item.returnTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Owner Info */}
      {item.owner && (
        <View className="mb-3">
          <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
            Vlasnik opreme:
          </Text>
          <Text className="text-sm font-medium" style={{ color: colors.text }}>
            {item.owner.name}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row">
        {item.owner && (
          <TouchableOpacity
            onPress={() => handleContactOwner(item)}
            className="flex-1 mr-2 py-3 rounded-lg flex-row items-center justify-center"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <Ionicons name="chatbubble" size={16} color={colors.primary} />
            <Text className="ml-2 text-sm font-medium" style={{ color: colors.primary }}>
              Poruka
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => handleCancelBooking(item)}
          className={`${item.owner ? 'flex-1 ml-2' : 'flex-1'} py-3 rounded-lg flex-row items-center justify-center`}
          style={{ backgroundColor: colors.warning + '20' }}
        >
          <Ionicons name="close-circle" size={16} color={colors.warning} />
          <Text className="ml-2 text-sm font-medium" style={{ color: colors.warning }}>
            Otkaži
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Rezervacije
        </Text>
        {activeBookings.length > 0 && (
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {activeBookings.length} aktivna rezervacija{activeBookings.length > 1 ? 'e' : ''}
          </Text>
        )}
      </View>

      {/* Active Bookings List */}
      {activeBookings.length > 0 ? (
        <FlatList
          data={activeBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text
            className="text-lg font-semibold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Nema aktivnih rezervacija
          </Text>
          <Text
            className="text-sm text-center mb-6"
            style={{ color: colors.textSecondary }}
          >
            Kada rezervirate opremu, vaše rezervacije će se prikazati ovdje.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-semibold text-white">
              Rezerviraj opremu
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookingsScreen;