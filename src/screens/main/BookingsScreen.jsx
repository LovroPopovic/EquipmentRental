import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';
import { useFocusEffect } from '@react-navigation/native';
import { useBooking } from '../../context/BookingContext';

const BookingsScreen = ({ navigation }) => {
  const colors = useColors();
  const [activeBookings, setActiveBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { triggerRefresh } = useBooking();

  // Load user bookings from API
  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const currentUser = await authService.getUserInfo();
      if (!currentUser) {
        console.log('No user data available');
        setActiveBookings([]);
        return;
      }

      // Use backend user if available, otherwise use mock user data
      const userData = currentUser.backendUser || currentUser;
      let userId = userData.id || userData.userId;

      // Convert mock user format to match database
      if (!userId && userData.sub) {
        userId = userData.sub.startsWith('dev_') ? `mock_user_${userData.sub.split('_').pop()}` : userData.sub;
      }

      console.log('Current user data:', userData);
      console.log('Loading bookings for user ID:', userId);

      setUser(userData);

      // Get user's bookings
      const response = await apiService.getUserBookings(userId);
      const allBookings = response.data || [];

      // Filter out cancelled bookings
      const activeBookings = allBookings.filter(booking => booking.status !== 'CANCELLED');

      console.log('User bookings loaded:', activeBookings.length, 'active out of', allBookings.length, 'total');
      setActiveBookings(activeBookings);

    } catch (err) {
      console.error('Failed to load bookings:', err.message);
      setError(err.message);

      // No fallback - show empty state
      console.log('Showing empty bookings state...');
      setActiveBookings([]); // Use empty array as fallback

    } finally {
      setIsLoading(false);
    }
  };

  // Load bookings when component mounts and when screen is focused
  useEffect(() => {
    loadBookings();
  }, []);

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  // Handle booking cancellation
  const handleCancelBooking = async (booking) => {
    Alert.alert(
      'Otkaži rezervaciju',
      `Jeste li sigurni da želite otkazati rezervaciju za ${booking.equipment?.name || booking.equipmentName}?`,
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Da, otkaži',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelBooking(booking.id);
              Alert.alert('Uspjeh', 'Rezervacija je otkazana.');

              // Trigger global refresh for all booking-related screens
              triggerRefresh();

              loadBookings(); // Reload bookings
            } catch (error) {
              Alert.alert('Greška', 'Došlo je do greške prilikom otkazivanja rezervacije.');
              console.error('Cancel booking error:', error);
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


  const handleContactOwner = (booking) => {
    Alert.alert('Informacije', 'Kontakt funkcionalnost će biti dodana uskoro.');
  };

  const renderBookingItem = ({ item }) => {
    // Map backend data structure to display format
    const equipmentName = item.equipment?.name || item.equipmentName || 'Unknown Equipment';
    const category = item.equipment?.category || item.category || 'Unknown';
    const location = item.equipment?.location || item.location || 'Unknown Location';
    const status = item.status?.toLowerCase() || 'pending';

    return (
      <View
        className="p-4 mb-4 rounded-lg"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold mb-1" style={{ color: colors.text }}>
              {equipmentName}
            </Text>
            <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
              {category} • {location}
            </Text>
          </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: getStatusColor(status) + '20' }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: getStatusColor(status) }}
          >
            {getStatusText(status)}
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
            <Ionicons name="information-circle" size={16} color={colors.primary} />
            <Text className="ml-2 text-sm font-medium" style={{ color: colors.primary }}>
              Kontakt
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
  };

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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
            Učitavam rezervacije...
          </Text>
        </View>
      ) : activeBookings.length > 0 ? (
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