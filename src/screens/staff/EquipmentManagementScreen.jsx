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
import { mockEquipment } from '../../data/mockData';

const EquipmentCard = ({ item, colors, onPress, onEdit }) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    className="p-4 rounded-xl mb-3"
    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
  >
    <View className="flex-row items-start">
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: item.available ? '#22c55e' : '#ef4444' }}
      >
        <Ionicons
          name={item.available ? 'checkmark' : 'time'}
          size={20}
          color="white"
        />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-base mb-1" style={{ color: colors.text }}>
          {item.name}
        </Text>
        <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
          {item.category} • {item.location}
        </Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>
          {item.available ? 'Dostupno' : `Posuđeno: ${item.borrower?.name || 'N/A'}`}
        </Text>
        {item.owner && (
          <Text className="text-xs mt-1" style={{ color: colors.primary }}>
            Vlasnik: {item.owner.name}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onEdit(item)}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Ionicons name="create-outline" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const EquipmentManagementScreen = ({ navigation, route }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(route?.params?.filterStatus || 'all'); // 'all', 'available', 'borrowed'

  const filteredEquipment = mockEquipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'available' && item.available) ||
                         (filterStatus === 'borrowed' && !item.available);

    return matchesSearch && matchesFilter;
  });

  const handleEquipmentPress = (equipment) => {
    // Navigate to main EquipmentDetail screen
    navigation.navigate('EquipmentDetail', { equipment });
  };

  const handleEditEquipment = (equipment) => {
    navigation.navigate('AddStaffEquipment', { equipment, isEditMode: true });
  };

  const handleAddEquipment = () => {
    navigation.navigate('AddStaffEquipment');
  };

  const renderEquipmentItem = ({ item }) => (
    <EquipmentCard
      item={item}
      colors={colors}
      onPress={handleEquipmentPress}
      onEdit={handleEditEquipment}
    />
  );

  const getStatusCount = (status) => {
    if (status === 'all') return mockEquipment.length;
    if (status === 'available') return mockEquipment.filter(item => item.available).length;
    if (status === 'borrowed') return mockEquipment.filter(item => !item.available).length;
    return 0;
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="px-6 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              Upravljanje opremom
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {mockEquipment.length} ukupno oprema
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddEquipment}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
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
            placeholder="Pretražite opremu..."
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
            { key: 'available', label: 'Dostupno' },
            { key: 'borrowed', label: 'Posuđeno' }
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setFilterStatus(filter.key)}
              className="flex-1 py-3 px-4 rounded-xl mr-2"
              style={{
                backgroundColor: filterStatus === filter.key ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: filterStatus === filter.key ? colors.primary : colors.border
              }}
            >
              <Text
                className="text-center font-medium"
                style={{
                  color: filterStatus === filter.key ? 'white' : colors.text,
                  fontSize: 14
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

      {/* Equipment List */}
      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 24, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default EquipmentManagementScreen;