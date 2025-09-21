import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, FlatList, Alert, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/AuthService';
import { apiService } from '../../services/ApiService';
import { useBooking } from '../../context/BookingContext';

const ProfileScreen = ({ navigation }) => {
  const colors = useColors();
  const { theme, toggleTheme, isDark } = useTheme();

  // Real user data from backend
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshTrigger } = useBooking();

  // Load user profile data
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      // Get current user data (includes both AAI and backend data)
      const currentUser = await authService.getUserInfo();

      if (currentUser?.backendUser) {
        // Use backend user data if available
        const backendUser = currentUser.backendUser;
        setUser({
          name: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || 'User',
          email: backendUser.email || 'No email',
          userId: backendUser.id, // Use backend user ID for API calls
          role: backendUser.role || 'STUDENT',
          joinDate: backendUser.createdAt ? new Date(backendUser.createdAt).toLocaleDateString('hr-HR') : 'N/A'
        });
        console.log('👤 Profile loaded:', backendUser);
      } else if (currentUser) {
        // Fallback to AAI data
        const userId = currentUser.userId || `mock_user_${currentUser.sub?.split('_').pop()}` || 'unknown';
        console.log('👤 Available user fields:', Object.keys(currentUser));
        console.log('👤 Using userId:', userId);

        setUser({
          name: currentUser.name || 'User',
          email: currentUser.email || 'No email',
          userId: userId,
          role: 'STUDENT',
          joinDate: 'N/A'
        });
        console.log('👤 Profile loaded from AAI fallback');
      } else {
        // No user data available
        setUser({
          name: 'User',
          email: 'No email',
          userId: 'unknown',
          role: 'STUDENT',
          joinDate: 'N/A'
        });
        console.log('👤 No user data available');
      }
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
      // Keep mock data as ultimate fallback
      setUser({
        name: 'User',
        email: 'user@apu.hr',
        userId: 'unknown',
        role: 'STUDENT',
        joinDate: 'N/A'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Real reservation history from backend
  const [reservations, setReservations] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Load user's booking history
  const loadReservationHistory = async () => {
    if (!user?.userId) return;

    try {
      console.log('🔄 Loading reservation history...');
      console.log('📍 Sending user ID to backend:', user.userId);
      const response = await apiService.getUserBookings(user.userId);
      const allBookings = response.data || [];

      // Transform backend data to display format (include ALL bookings for history)
      const transformedBookings = allBookings.map(booking => ({
        id: booking.id,
        equipmentName: booking.equipment?.name || 'Unknown Equipment',
        category: booking.equipment?.category || 'Unknown',
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status?.toLowerCase() === 'cancelled' ? 'cancelled' :
                booking.status?.toLowerCase() === 'completed' ? 'completed' :
                booking.status?.toLowerCase() || 'pending',
        owner: booking.equipment?.owner || null,
        location: booking.equipment?.location || 'Unknown Location'
      }));

      setReservations(transformedBookings);
      console.log('📋 Reservation history loaded:', transformedBookings.length);
    } catch (error) {
      console.error('❌ Failed to load reservation history:', error);
      setReservations([]); // Empty array on error, no fallback
    }
  };

  // Load reservations when user data is available
  useEffect(() => {
    if (user?.userId) {
      loadReservationHistory();
    }
  }, [user]);

  // Listen for booking changes and refresh reservation history
  useEffect(() => {
    if (refreshTrigger > 0 && user?.userId) {
      console.log('🔄 ProfileScreen: Refreshing reservation history due to booking change, trigger:', refreshTrigger);
      const timeout = setTimeout(() => {
        loadReservationHistory();
      }, 500); // Small delay to ensure backend has processed the change

      return () => clearTimeout(timeout);
    }
  }, [refreshTrigger, user?.userId]);


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
                {user?.name || 'Loading...'}
              </Text>
              <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                {user?.email || 'Loading...'}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {user?.userId || 'Loading...'}
              </Text>
            </View>
          </View>

          <View className="pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Odsjek:
              </Text>
              <Text className="text-sm font-medium" style={{ color: colors.text }}>
                {user?.department || user?.role || 'Loading...'}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Član od:
              </Text>
              <Text className="text-sm font-medium" style={{ color: colors.text }}>
                {user?.joinDate ? formatDate(user.joinDate) : 'Loading...'}
              </Text>
            </View>
          </View>
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
              {(showAllHistory ? reservationHistory : reservationHistory.slice(0, 3)).map(item => (
                <View key={item.id}>
                  {renderReservationItem({ item })}
                </View>
              ))}
              {reservationHistory.length > 3 && (
                <TouchableOpacity
                  onPress={() => setShowAllHistory(!showAllHistory)}
                  className="mt-3 py-3 rounded-lg items-center"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                    {showAllHistory ? 'Prikaži manje' : `Prikaži sve (${reservationHistory.length})`}
                  </Text>
                </TouchableOpacity>
              )}
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