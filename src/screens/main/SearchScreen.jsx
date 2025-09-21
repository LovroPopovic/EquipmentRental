import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, TextInput, FlatList, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useColors } from '../../hooks/useColors';
import { apiService } from '../../services/ApiService';
import { useBooking } from '../../context/BookingContext';
import { authService } from '../../services/AuthService';

const SearchScreen = ({ navigation }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, unavailable
  const [ownerFilter, setOwnerFilter] = useState('all'); // all, university, private
  const [showFilters, setShowFilters] = useState(false);
  const [allEquipment, setAllEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { refreshTrigger } = useBooking();

  // Load equipment from API
  useEffect(() => {
    loadEquipment();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [searchQuery, selectedCategory, availabilityFilter, ownerFilter, allEquipment]);

  // Listen for booking changes and refresh equipment list
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('SearchScreen: Refreshing equipment list due to booking change');
      loadEquipment();
    }
  }, [refreshTrigger]);

  // Generate categories dynamically from equipment data
  const getAvailableCategories = () => {
    const categorySet = new Set();
    allEquipment.forEach(item => {
      if (item.category) {
        categorySet.add(item.category);
      }
    });

    return Array.from(categorySet).map((categoryName, index) => ({
      id: index + 1,
      name: categoryName,
      icon: getCategoryIcon(categoryName)
    }));
  };

  // Get appropriate icon for category
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('camera') || name.includes('kamera')) return 'camera';
    if (name.includes('laptop') || name.includes('računal')) return 'laptop';
    if (name.includes('tablet')) return 'tablet-portrait';
    if (name.includes('studio')) return 'business';
    return 'hardware-chip';
  };

  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getEquipment();
      const equipment = response.data || [];
      setAllEquipment(equipment);
      setFilteredEquipment(equipment);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      setAllEquipment([]);
      setFilteredEquipment([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userInfo = await authService.getUserInfo();
      if (userInfo) {
        const userData = userInfo.backendUser || userInfo;
        let userId = userData.id || userData.userId;

        if (!userId && userData.sub) {
          userId = userData.sub.startsWith('dev_') ? `mock_user_${userData.sub.split('_').pop()}` : userData.sub;
        }

        setCurrentUser({ ...userData, userId });
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  // Helper function to check if equipment is truly available
  const isEquipmentAvailable = (item) => {
    // Check if current user has a booking for this equipment
    const userBooking = item.bookings?.find(booking =>
      booking.userId === currentUser?.userId &&
      ['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status)
    );

    // If current user has a booking, it shows as their booking (handled separately)
    if (userBooking) {
      return false; // Will be handled by user booking logic
    }

    // Check if other users have pending, approved, or active bookings
    const otherUsersActiveBookings = item.bookings?.filter(booking =>
      booking.userId !== currentUser?.userId &&
      ['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status)
    );

    return item.available && (!otherUsersActiveBookings || otherUsersActiveBookings.length === 0);
  };

  const filterEquipment = () => {
    let filtered = allEquipment;

    // Text search
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== '') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(item => isEquipmentAvailable(item));
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(item => !isEquipmentAvailable(item));
    }

    // Owner filter
    if (ownerFilter === 'university') {
      filtered = filtered.filter(item => !item.owner);
    } else if (ownerFilter === 'private') {
      filtered = filtered.filter(item => item.owner);
    }

    setFilteredEquipment(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setAvailabilityFilter('all');
    setOwnerFilter('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== '') count++;
    if (availabilityFilter !== 'all') count++;
    if (ownerFilter !== 'all') count++;
    return count;
  };

  const handleEquipmentPress = (equipment) => {
    navigation.navigate('EquipmentDetail', { equipment });
  };

  const renderEquipmentItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleEquipmentPress(item)}
      className="flex-row p-4 mb-3 rounded-lg"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      {/* Equipment Image */}
      <View className="w-16 h-16 rounded-lg mr-3 overflow-hidden">
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
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{ backgroundColor: colors.background }}
            >
              <Ionicons
                name={
                  item.category?.toLowerCase().includes('kamer') ? 'camera' :
                  item.category?.toLowerCase().includes('stativ') ? 'camera-outline' :
                  item.category?.toLowerCase().includes('tablet') ? 'tablet-portrait' :
                  item.category?.toLowerCase().includes('studio') ? 'business' :
                  item.category?.toLowerCase().includes('računal') ? 'laptop' :
                  item.category?.toLowerCase().includes('audio') ? 'musical-notes' :
                  item.category?.toLowerCase().includes('mreža') ? 'wifi' :
                  item.category?.toLowerCase().includes('vr') ? 'glasses' :
                  'hardware-chip'
                }
                size={24}
                color={colors.textSecondary}
              />
            </View>
          );
        })()}
      </View>

      {/* Equipment Info */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between mb-1">
          <Text
            className="text-base font-semibold flex-1"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center ml-2">
            {(() => {
              // Check if current user has a booking for this equipment
              const userBooking = item.bookings?.find(booking =>
                booking.userId === currentUser?.userId &&
                ['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status)
              );

              if (userBooking) {
                return (
                  <>
                    <View
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: userBooking.status === 'PENDING' ? '#F59E0B' : '#10B981' }}
                    />
                    <Text
                      className="text-xs"
                      style={{ color: userBooking.status === 'PENDING' ? '#F59E0B' : '#10B981' }}
                    >
                      Moja rezervacija
                    </Text>
                  </>
                );
              } else {
                const isAvailable = isEquipmentAvailable(item);
                return (
                  <>
                    <View
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: isAvailable ? colors.success : colors.warning }}
                    />
                    <Text
                      className="text-xs"
                      style={{ color: isAvailable ? colors.success : colors.warning }}
                    >
                      {isAvailable ? 'Dostupno' : 'Rezervirano'}
                    </Text>
                  </>
                );
              }
            })()}
          </View>
        </View>

        <Text
          className="text-sm mb-1"
          style={{ color: colors.textSecondary }}
        >
          {item.category} • {item.location}
        </Text>

        <Text
          className="text-sm mb-2"
          style={{ color: colors.textSecondary }}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Owner/Borrower Info */}
        <View>
          {item.owner && (
            <Text
              className="text-xs"
              style={{ color: colors.textSecondary }}
            >
              Vlasnik: {item.owner.name}
            </Text>
          )}
          {!item.available && item.borrower && (
            <Text
              className="text-xs"
              style={{ color: colors.textSecondary }}
            >
              Posudio: {item.borrower.name}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const FiltersModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl" style={{ backgroundColor: colors.background, maxHeight: '80%' }}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Filtri
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View className="p-6">
            {/* Category Filter */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                Kategorija
              </Text>
              <View className="flex-row flex-wrap">
                <TouchableOpacity
                  onPress={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${selectedCategory === '' ? 'border-2' : 'border'}`}
                  style={{
                    backgroundColor: selectedCategory === '' ? colors.primary + '20' : colors.surface,
                    borderColor: selectedCategory === '' ? colors.primary : colors.border
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: selectedCategory === '' ? colors.primary : colors.text }}
                  >
                    Sve
                  </Text>
                </TouchableOpacity>
                {getAvailableCategories().map(category => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${selectedCategory === category.name ? 'border-2' : 'border'}`}
                    style={{
                      backgroundColor: selectedCategory === category.name ? colors.primary + '20' : colors.surface,
                      borderColor: selectedCategory === category.name ? colors.primary : colors.border
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: selectedCategory === category.name ? colors.primary : colors.text }}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Availability Filter */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                Dostupnost
              </Text>
              <View className="flex-row">
                {[
                  { value: 'all', label: 'Sve' },
                  { value: 'available', label: 'Dostupno' },
                  { value: 'unavailable', label: 'Rezervirano' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setAvailabilityFilter(option.value)}
                    className={`px-4 py-2 rounded-full mr-2 ${availabilityFilter === option.value ? 'border-2' : 'border'}`}
                    style={{
                      backgroundColor: availabilityFilter === option.value ? colors.primary + '20' : colors.surface,
                      borderColor: availabilityFilter === option.value ? colors.primary : colors.border
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: availabilityFilter === option.value ? colors.primary : colors.text }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Owner Filter */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                Vlasništvo
              </Text>
              <View className="flex-row">
                {[
                  { value: 'all', label: 'Sve' },
                  { value: 'university', label: 'Sveučilište' },
                  { value: 'private', label: 'Privatno' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setOwnerFilter(option.value)}
                    className={`px-4 py-2 rounded-full mr-2 ${ownerFilter === option.value ? 'border-2' : 'border'}`}
                    style={{
                      backgroundColor: ownerFilter === option.value ? colors.primary + '20' : colors.surface,
                      borderColor: ownerFilter === option.value ? colors.primary : colors.border
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: ownerFilter === option.value ? colors.primary : colors.text }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="p-6 flex-row">
            <TouchableOpacity
              onPress={clearFilters}
              className="flex-1 mr-3 py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                Očisti sve
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              className="flex-1 ml-3 py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-base font-bold text-white">
                Primijeni ({filteredEquipment.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
          Pretraži
        </Text>

        {/* Search Bar with Filter */}
        <View className="flex-row items-center mb-4" style={{ height: 48 }}>
          <View
            className="flex-1 flex-row items-center px-4 rounded-xl mr-3"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              height: 48
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

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="items-center justify-center px-4 rounded-xl relative"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              height: 48,
              width: 48
            }}
          >
            <Ionicons name="options" size={20} color={colors.text} />
            {getActiveFiltersCount() > 0 && (
              <View
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-xs font-bold text-white">
                  {getActiveFiltersCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {(selectedCategory !== '' || availabilityFilter !== 'all' || ownerFilter !== 'all') && (
          <View className="mb-4">
            <View className="flex-row flex-wrap">
              {selectedCategory !== '' && (
                <View
                  className="flex-row items-center px-3 py-1 rounded-full mr-2 mb-2"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <Text className="text-sm" style={{ color: colors.primary }}>
                    {selectedCategory}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory('')}
                    className="ml-2"
                  >
                    <Ionicons name="close" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              {availabilityFilter !== 'all' && (
                <View
                  className="flex-row items-center px-3 py-1 rounded-full mr-2 mb-2"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <Text className="text-sm" style={{ color: colors.primary }}>
                    {availabilityFilter === 'available' ? 'Dostupno' : 'Rezervirano'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAvailabilityFilter('all')}
                    className="ml-2"
                  >
                    <Ionicons name="close" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              {ownerFilter !== 'all' && (
                <View
                  className="flex-row items-center px-3 py-1 rounded-full mr-2 mb-2"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <Text className="text-sm" style={{ color: colors.primary }}>
                    {ownerFilter === 'university' ? 'Sveučilište' : 'Privatno'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setOwnerFilter('all')}
                    className="ml-2"
                  >
                    <Ionicons name="close" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Results Count */}
        <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
          {filteredEquipment.length} rezultata
        </Text>
      </View>

      {/* Equipment List */}
      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-8">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="search-outline" size={24} color={colors.textSecondary} />
            </View>
            <Text
              className="text-lg font-semibold mb-2 text-center"
              style={{ color: colors.text }}
            >
              Nema rezultata
            </Text>
            <Text
              className="text-sm text-center"
              style={{ color: colors.textSecondary }}
            >
              Pokušajte s drugim pojmovima za pretraživanje ili promijenite filtre.
            </Text>
          </View>
        }
      />

      <FiltersModal />
    </SafeAreaView>
  );
};

export default SearchScreen;