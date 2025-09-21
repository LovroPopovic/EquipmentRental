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
import { Image } from 'expo-image';
import { useColors } from '../../hooks/useColors';
import { apiService } from '../../services/ApiService';
import { useFocusEffect } from '@react-navigation/native';

const EquipmentCard = ({ item, colors, onPress, onEdit }) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    className="p-4 rounded-xl mb-3"
    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
  >
    <View className="flex-row items-start">
      {/* Equipment Image */}
      <View className="w-12 h-12 rounded-xl mr-4 overflow-hidden relative">
        {(() => {
          let imageUri = null;
          if (item.imageUrl) {
            try {
              const imageArray = JSON.parse(item.imageUrl);
              imageUri = Array.isArray(imageArray) ? imageArray[0] : item.imageUrl;
            } catch {
              imageUri = item.imageUrl;
            }
          }

          return imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              {/* Status Indicator Overlay */}
              <View
                className="absolute top-0 right-0 w-4 h-4 rounded-full items-center justify-center"
                style={{ backgroundColor: item.available ? '#22c55e' : '#ef4444' }}
              >
                <Ionicons
                  name={item.available ? 'checkmark' : 'time'}
                  size={10}
                  color="white"
                />
              </View>
            </>
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{ backgroundColor: item.available ? '#22c55e' : '#ef4444' }}
            >
              <Ionicons
                name={item.available ? 'checkmark' : 'time'}
                size={20}
                color="white"
              />
            </View>
          );
        })()}
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
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  // Refresh equipment when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadEquipment();
    }, [])
  );

  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      console.log('Loading equipment for staff...');

      const response = await apiService.getEquipment();
      const equipmentData = response.data || [];

      // Process equipment data to include borrower information
      const processedEquipment = equipmentData.map(item => {
        // Find active booking (if any)
        const activeBooking = item.bookings?.find(booking =>
          booking.status === 'ACTIVE' || booking.status === 'APPROVED'
        );

        return {
          ...item,
          borrower: activeBooking ? {
            name: `${activeBooking.user.firstName} ${activeBooking.user.lastName}`,
            id: activeBooking.user.id
          } : null
        };
      });

      setEquipment(processedEquipment);
      console.log('Equipment loaded for staff:', equipmentData.length);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      setEquipment([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item => {
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
    if (status === 'all') return equipment.length;
    if (status === 'available') return equipment.filter(item => item.available).length;
    if (status === 'borrowed') return equipment.filter(item => !item.available).length;
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
              {equipment.length} ukupno oprema
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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
            Učitavam opremu...
          </Text>
        </View>
      ) : filteredEquipment.length > 0 ? (
        <FlatList
          data={filteredEquipment}
          renderItem={renderEquipmentItem}
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
            <Ionicons name="construct-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text
            className="text-lg font-semibold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Nema opreme
          </Text>
          <Text
            className="text-sm text-center mb-4"
            style={{ color: colors.textSecondary }}
          >
            {searchQuery ? 'Pokušajte s drugim pojmovima za pretraživanje.' : 'Dodajte opremu da biste počeli upravljati njome.'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              onPress={handleAddEquipment}
              className="px-6 py-3 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-base font-semibold text-white">
                Dodaj opremu
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default EquipmentManagementScreen;