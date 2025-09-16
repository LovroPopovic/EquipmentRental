import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

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
                          item.status === 'returned' ? '#22c55e' : '#8b5cf6'
        }}
      >
        <Ionicons
          name={
            item.status === 'borrowed' ? 'arrow-up' :
            item.status === 'returned' ? 'arrow-down' : 'time'
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
                            item.status === 'returned' ? '#f0fdf4' : '#faf5ff'
          }}
        >
          <Text
            className="text-xs font-medium"
            style={{
              color: item.status === 'borrowed' ? '#dc2626' :
                     item.status === 'returned' ? '#16a34a' : '#7c3aed'
            }}
          >
            {item.status === 'borrowed' ? 'Posuđeno' :
             item.status === 'returned' ? 'Vraćeno' : 'Overdue'}
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

const EquipmentHistoryScreen = ({ navigation }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock history data
  const [historyData] = useState([
    {
      id: 1,
      equipment: 'Canon EOS R5',
      student: 'Ana Marić',
      status: 'borrowed',
      borrowDate: '15.01.2024',
      returnDate: null,
      duration: '3 dana',
      notes: 'Za projektni rad iz fotografije'
    },
    {
      id: 2,
      equipment: 'MacBook Pro 16"',
      student: 'Petar Novak',
      status: 'returned',
      borrowDate: '10.01.2024',
      returnDate: '14.01.2024',
      duration: '4 dana',
      notes: 'Završni rad - video montaža'
    },
    {
      id: 3,
      equipment: 'Sony A7 III',
      student: 'Marija Kovač',
      status: 'borrowed',
      borrowDate: '12.01.2024',
      returnDate: null,
      duration: '6 dana',
      notes: null
    },
    {
      id: 4,
      equipment: 'iPad Pro 12.9"',
      student: 'Luka Jurić',
      status: 'returned',
      borrowDate: '08.01.2024',
      returnDate: '12.01.2024',
      duration: '4 dana',
      notes: 'Dizajnerski projekt'
    },
    {
      id: 5,
      equipment: 'Manfrotto Tripod',
      student: 'Sara Babić',
      status: 'overdue',
      borrowDate: '05.01.2024',
      returnDate: null,
      duration: '13 dana',
      notes: 'Trebao biti vraćen 10.01.'
    }
  ]);

  const filteredHistory = historyData.filter(item => {
    const matchesSearch = item.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.student.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleHistoryItemPress = (item) => {
    // Navigate to borrowing detail screen
    navigation.navigate('BorrowingDetail', { borrowing: item });
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
            { key: 'borrowed', label: 'Posuđeno' },
            { key: 'returned', label: 'Vraćeno' },
            { key: 'overdue', label: 'Kasni' }
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
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 24, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default EquipmentHistoryScreen;