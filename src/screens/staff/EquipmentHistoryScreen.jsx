import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { apiService } from '../../services/ApiService';

const HistoryItem = ({ item, colors, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    className="p-4 rounded-xl mb-3"
    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
  >
    <View className="flex-row items-start">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: item.status === 'borrowed' ? '#ef4444' :
                          item.status === 'returned' ? '#22c55e' :
                          item.status === 'pending' ? '#f59e0b' :
                          item.status === 'approved' ? '#3b82f6' : '#8b5cf6'
        }}
      >
        <Ionicons
          name={
            item.status === 'borrowed' ? 'arrow-up' :
            item.status === 'returned' ? 'arrow-down' :
            item.status === 'pending' ? 'hourglass' :
            item.status === 'approved' ? 'checkmark' : 'time'
          }
          size={16}
          color="white"
        />
      </View>
      <View className="flex-1">
        <Text className="font-semibold mb-1" style={{ color: colors.text }}>
          {item.equipment}
        </Text>
        <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
          Student: {item.student}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {item.borrowDate}
          </Text>
          {item.returnDate && (
            <>
              <Text className="text-xs mx-2" style={{ color: colors.textSecondary }}>→</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {item.returnDate}
              </Text>
            </>
          )}
        </View>
        {item.notes && (
          <Text className="text-xs mt-2 italic" style={{ color: colors.textSecondary }}>
            "{item.notes}"
          </Text>
        )}
      </View>
      <View className="items-end">
        <View
          className="px-2 py-1 rounded-full"
          style={{
            backgroundColor: item.status === 'borrowed' ? '#fef2f2' :
                            item.status === 'returned' ? '#f0fdf4' :
                            item.status === 'pending' ? '#fffbeb' :
                            item.status === 'approved' ? '#eff6ff' : '#faf5ff'
          }}
        >
          <Text
            className="text-xs font-medium"
            style={{
              color: item.status === 'borrowed' ? '#dc2626' :
                     item.status === 'returned' ? '#16a34a' :
                     item.status === 'pending' ? '#d97706' :
                     item.status === 'approved' ? '#2563eb' : '#7c3aed'
            }}
          >
            {item.status === 'borrowed' ? 'Posuđeno' :
             item.status === 'returned' ? 'Vraćeno' :
             item.status === 'pending' ? 'Na čekanju' :
             item.status === 'approved' ? 'Odobreno' : 'Overdue'}
          </Text>
        </View>
        {item.duration && (
          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            {item.duration}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

const EquipmentHistoryScreen = ({ navigation, route }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(route.params?.initialFilter || 'all');
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookingHistory();
  }, []);

  const loadBookingHistory = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading booking history...');

      const response = await apiService.getBookings();
      const bookings = response.data || [];

      // Transform backend data to history format
      const transformedHistory = bookings.map(booking => ({
        id: booking.id,
        equipment: booking.equipment?.name || 'Unknown Equipment',
        student: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Unknown Student',
        status: booking.status === 'ACTIVE' ? 'borrowed' :
                booking.status === 'RETURNED' ? 'returned' :
                booking.status === 'CANCELLED' ? 'cancelled' :
                booking.status === 'PENDING' ? 'pending' :
                booking.status === 'APPROVED' ? 'approved' : 'pending',
        borrowDate: booking.startDate ? new Date(booking.startDate).toLocaleDateString('hr-HR') : 'N/A',
        returnDate: booking.endDate && booking.status === 'RETURNED' ? new Date(booking.endDate).toLocaleDateString('hr-HR') : null,
        duration: calculateDuration(booking.startDate, booking.endDate),
        notes: booking.notes || null
      }));

      setHistoryData(transformedHistory);
      console.log('📋 Booking history loaded:', transformedHistory.length);
    } catch (error) {
      console.error('❌ Failed to load booking history:', error);
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return 'N/A';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} dan${diffDays > 1 ? 'a' : ''}`;
  };

  const filteredHistory = historyData.filter(item => {
    const matchesSearch = item.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.student.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleHistoryItemPress = (item) => {
    // Navigate to borrowing detail screen
    navigation.navigate('BorrowingDetail', {
      borrowing: item,
      onRefresh: loadBookingHistory
    });
  };

  const renderHistoryItem = ({ item }) => (
    <HistoryItem item={item} colors={colors} onPress={handleHistoryItemPress} />
  );

  const getStatusCount = (status) => {
    if (status === 'all') return historyData.length;
    return historyData.filter(item => item.status === status).length;
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="px-6 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Povijest opreme
        </Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          {historyData.length} ukupno transakcija
        </Text>
      </View>

      {/* Search and Filters */}
      <View className="px-6 py-4">
        {/* Search */}
        <View
          className="flex-row items-center px-4 py-3 rounded-xl mb-4"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Pretražite povijest..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-base"
            style={{ color: colors.text }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter */}
        <View className="flex-row">
          {[
            { key: 'all', label: 'Sve' },
            { key: 'pending', label: 'Na čekanju' },
            { key: 'approved', label: 'Odobreno' },
            { key: 'borrowed', label: 'Posuđeno' },
            { key: 'returned', label: 'Vraćeno' }
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setFilterStatus(filter.key)}
              className="flex-1 py-2 px-2 rounded-xl mr-1"
              style={{
                backgroundColor: filterStatus === filter.key ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: filterStatus === filter.key ? colors.primary : colors.border
              }}
            >
              <Text
                className="text-center font-medium text-xs"
                style={{
                  color: filterStatus === filter.key ? 'white' : colors.text
                }}
              >
                {filter.label}
              </Text>
              <Text
                className="text-center text-xs mt-1"
                style={{
                  color: filterStatus === filter.key ? 'white' : colors.textSecondary
                }}
              >
                {getStatusCount(filter.key)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* History List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
            Učitavam povijest...
          </Text>
        </View>
      ) : filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 24, paddingTop: 0 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="time-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text
            className="text-lg font-semibold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Nema povijesti
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: colors.textSecondary }}
          >
            {searchQuery ? 'Pokušajte s drugim pojmovima za pretraživanje.' : 'Povijest posudbi će se prikazati ovdje.'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default EquipmentHistoryScreen;