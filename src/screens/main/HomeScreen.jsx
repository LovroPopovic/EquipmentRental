import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useColors } from '../../hooks/useColors';
import { apiService } from '../../services/ApiService';
import { authService } from '../../services/AuthService';
import { useBooking } from '../../context/BookingContext';

const EquipmentCard = ({ item, colors, onPress, currentUser }) => {
  // Check if current user has a booking for this equipment
  const userBooking = item.bookings?.find(booking =>
    booking.userId === currentUser?.userId &&
    ['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status)
  );

  // Determine status display
  const getStatusInfo = () => {
    if (userBooking) {
      return {
        available: false,
        statusText: userBooking.status === 'PENDING' ? 'Moja rezervacija (Čeka odobrenje)' :
                   userBooking.status === 'APPROVED' ? 'Moja rezervacija (Odobreno)' :
                   'Moja rezervacija (Aktivno)',
        color: userBooking.status === 'PENDING' ? '#F59E0B' : '#10B981'
      };
    } else {
      // Check if other users have pending, approved, or active bookings
      const otherUsersActiveBookings = item.bookings?.filter(booking =>
        booking.userId !== currentUser?.userId &&
        ['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status)
      );

      if (!item.available || (otherUsersActiveBookings && otherUsersActiveBookings.length > 0)) {
        return {
          available: false,
          statusText: 'Rezervirano',
          color: '#EF4444'
        };
      } else {
        return {
          available: true,
          statusText: 'Dostupno',
          color: '#10B981'
        };
      }
    }
  };

  const statusInfo = getStatusInfo();

  return (
  <TouchableOpacity
    onPress={() => onPress(item)}
    className="flex-1 m-2 rounded-xl overflow-hidden"
    style={{ 
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border 
    }}
  >
    {/* Equipment Image */}
    <View
      className="aspect-square items-center justify-center"
      style={{ backgroundColor: colors.surface }}
    >
      {(() => {
        // Get first image from JSON array or use single image
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
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={200}
          />
        ) : (
          <Ionicons
            name={
              item.category === 'kamere' ? 'camera' :
              item.category === 'stativni' ? 'camera-outline' :
              item.category === 'tableti' ? 'tablet-portrait' :
              item.category === 'studijski' ? 'business' :
              item.category === 'računala' ? 'laptop' :
              item.category === 'audio' ? 'headset' :
              item.category === 'mreža' ? 'wifi' :
              item.category === 'vr' ? 'glasses' :
              'hardware-chip'
            }
            size={48}
            color={colors.textSecondary}
          />
        );
      })()}
    </View>
    
    {/* Equipment Info */}
    <View className="p-3">
      <Text 
        className="text-sm font-semibold mb-1" 
        style={{ color: colors.text }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      
      <Text 
        className="text-xs mb-2" 
        style={{ color: colors.textSecondary }}
        numberOfLines={1}
      >
        {item.category}
      </Text>
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: statusInfo.color }}
          />
          <Text
            className="text-xs"
            style={{ color: statusInfo.color }}
          >
            {statusInfo.statusText}
          </Text>
        </View>
      </View>

      {!item.available && item.borrower && (
        <View className="mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            Posudio/la: <Text style={{ color: colors.text, fontWeight: '500' }}>{item.borrower.name}</Text>
          </Text>
          <Text
            className="text-xs mt-1"
            style={{ color: colors.textSecondary }}
          >
            {item.borrower.role === 'student' ? 'Student' : 'Nastavnik'}
          </Text>
        </View>
      )}

      {item.owner && (
        <View className="mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            Vlasnik: <Text style={{ color: colors.text, fontWeight: '500' }}>{item.owner.name}</Text>
          </Text>
        </View>
      )}

      <Text
        className="text-xs mt-1"
        style={{ color: colors.textSecondary }}
      >
        {item.location}
      </Text>
    </View>
  </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    categories: [],
    availability: 'all', // 'all', 'available', 'borrowed'
    hasOwner: 'all' // 'all', 'owned', 'university'
  });
  const { refreshTrigger } = useBooking();

  // Generate categories dynamically from equipment data
  const getAvailableCategories = () => {
    const categorySet = new Set();
    equipment.forEach(item => {
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

  // Load equipment data from API
  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading equipment from backend API...');
      const response = await apiService.getEquipment();

      console.log('Equipment loaded:', response.data?.length || 0, 'items');

      const equipmentData = response.data || [];
      setEquipment(equipmentData);
      setFilteredEquipment(equipmentData);

    } catch (err) {
      console.error('Failed to load equipment:', err.message);
      setError(err.message);

      // No fallback - show error state
      setEquipment([]);
      setFilteredEquipment([]);

    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userInfo = await authService.getUserInfo();
      if (userInfo) {
        // Use same logic as other screens to get userId
        const userData = userInfo.backendUser || userInfo;
        let userId = userData.id || userData.userId;

        // Convert mock user format to match database
        if (!userId && userData.sub) {
          userId = userData.sub.startsWith('dev_') ? `mock_user_${userData.sub.split('_').pop()}` : userData.sub;
        }

        setCurrentUser({ ...userData, userId });
        console.log('Current user loaded for equipment:', userId);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  // Load equipment and user on component mount
  useEffect(() => {
    loadEquipment();
    loadCurrentUser();
  }, []);

  // Listen for booking changes and refresh equipment
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('HomeScreen: Refreshing due to booking change');
      loadEquipment();
    }
  }, [refreshTrigger]);

  const applyFilters = async (query = searchQuery, currentFilters = filters) => {
    setIsLoading(true);

    // Simulate async operation for better UX
    await new Promise(resolve => setTimeout(resolve, 200));

    let filtered = equipment;

    // Apply search query
    if (query.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply category filter
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(item =>
        currentFilters.categories.includes(item.category)
      );
    }

    // Apply availability filter
    if (currentFilters.availability !== 'all') {
      if (currentFilters.availability === 'available') {
        filtered = filtered.filter(item => item.available);
      } else if (currentFilters.availability === 'borrowed') {
        filtered = filtered.filter(item => !item.available);
      }
    }

    // Apply owner filter
    if (currentFilters.hasOwner !== 'all') {
      if (currentFilters.hasOwner === 'owned') {
        filtered = filtered.filter(item => item.owner !== null);
      } else if (currentFilters.hasOwner === 'university') {
        filtered = filtered.filter(item => item.owner === null);
      }
    }

    setFilteredEquipment(filtered);
    setIsLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query);
  };

  const handleEquipmentPress = (equipment) => {
    navigation.navigate('EquipmentDetail', { equipment });
  };

  const renderEquipmentItem = ({ item }) => (
    <EquipmentCard item={item} colors={colors} onPress={handleEquipmentPress} currentUser={currentUser} />
  );

  const handleCategoryToggle = (categoryName) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
    setShowFilterModal(false);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
    setShowFilterModal(false);
  };

  const clearAllFilters = () => {
    const newFilters = {
      categories: [],
      availability: 'all',
      hasOwner: 'all'
    };
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl" style={{ backgroundColor: colors.background, maxHeight: '80%' }}>
          <View className="flex-row items-center justify-between p-6 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Filteri
            </Text>
            <View className="flex-row">
              <TouchableOpacity onPress={clearAllFilters} className="mr-4">
                <Text style={{ color: colors.primary, fontSize: 16 }}>Očisti</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="p-6">
            {/* Categories */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                Kategorije
              </Text>
              <View className="flex-row flex-wrap">
                {getAvailableCategories().map(category => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleCategoryToggle(category.name)}
                    className="mr-3 mb-3 px-4 py-2 rounded-full flex-row items-center"
                    style={{
                      backgroundColor: filters.categories.includes(category.name)
                        ? colors.primary
                        : colors.surface,
                      borderWidth: 1,
                      borderColor: filters.categories.includes(category.name)
                        ? colors.primary
                        : colors.border
                    }}
                  >
                    <Ionicons
                      name={category.icon}
                      size={16}
                      color={filters.categories.includes(category.name) ? 'white' : colors.text}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{
                      color: filters.categories.includes(category.name) ? 'white' : colors.text,
                      fontSize: 14
                    }}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Availability */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                Dostupnost
              </Text>
              {[
                { key: 'all', label: 'Sve' },
                { key: 'available', label: 'Dostupno' },
                { key: 'borrowed', label: 'Rezervirano' }
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleFilterChange('availability', option.key)}
                  className="flex-row items-center py-3"
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <View
                    className="w-5 h-5 rounded-full mr-3 items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: filters.availability === option.key ? colors.primary : colors.border
                    }}
                  >
                    {filters.availability === option.key && (
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                    )}
                  </View>
                  <Text style={{ color: colors.text, fontSize: 16 }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Owner Type */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                Vlasništvo
              </Text>
              {[
                { key: 'all', label: 'Sve' },
                { key: 'owned', label: 'Privatno vlasništvo' },
                { key: 'university', label: 'Univerzitetska oprema' }
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleFilterChange('hasOwner', option.key)}
                  className="flex-row items-center py-3"
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <View
                    className="w-5 h-5 rounded-full mr-3 items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: filters.hasOwner === option.key ? colors.primary : colors.border
                    }}
                  >
                    {filters.hasOwner === option.key && (
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                    )}
                  </View>
                  <Text style={{ color: colors.text, fontSize: 16 }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
          Početna
        </Text>
        
        {/* Search Bar with Filter and Add */}
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
              onChangeText={handleSearch}
              className="flex-1 ml-3 text-base"
              style={{ color: colors.text }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className="items-center justify-center px-4 rounded-xl mr-2"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              height: 48,
              width: 48
            }}
          >
            <Ionicons name="options" size={20} color={colors.text} />
          </TouchableOpacity>

        </View>
      </View>

      {/* Equipment Grid */}
      <View className="flex-1">
        <FlatList
          data={filteredEquipment}
          renderItem={renderEquipmentItem}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 8 }}
          showsVerticalScrollIndicator={false}
        />

        {isLoading && (
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <View
              className="p-4 rounded-xl items-center"
              style={{ backgroundColor: colors.background }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-sm mt-2" style={{ color: colors.text }}>
                Pretražujem...
              </Text>
            </View>
          </View>
        )}
      </View>

      <FilterModal />
    </SafeAreaView>
  );
};

export default HomeScreen;