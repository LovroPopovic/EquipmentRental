import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { mockEquipment, mockCategories } from '../../data/mockData';

const EquipmentCard = ({ item, colors, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    className="flex-1 m-2 rounded-xl overflow-hidden"
    style={{ 
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border 
    }}
  >
    {/* Equipment Image Placeholder */}
    <View 
      className="aspect-square items-center justify-center"
      style={{ backgroundColor: colors.surface }}
    >
      <Ionicons 
        name={
          item.category === 'Kamere' ? 'camera' :
          item.category === 'Stativni' ? 'camera-outline' :
          item.category === 'Tableti' ? 'tablet-portrait' :
          item.category === 'Studijski' ? 'business' :
          item.category === 'Računala' ? 'laptop' :
          'hardware-chip'
        }
        size={48}
        color={colors.textSecondary}
      />
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
            style={{ backgroundColor: item.available ? '#10B981' : '#F59E0B' }}
          />
          <Text
            className="text-xs"
            style={{ color: item.available ? '#10B981' : '#F59E0B' }}
          >
            {item.available ? 'Dostupno' : 'Rezervirano'}
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

const HomeScreen = ({ navigation }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState(mockEquipment);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    availability: 'all', // 'all', 'available', 'borrowed'
    hasOwner: 'all' // 'all', 'owned', 'university'
  });

  const applyFilters = async (query = searchQuery, currentFilters = filters) => {
    setIsLoading(true);

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = mockEquipment;

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
    <EquipmentCard item={item} colors={colors} onPress={handleEquipmentPress} />
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
                {mockCategories.map(category => (
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

          {/* Add Item Button */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('AddEquipment');
            }}
            className="items-center justify-center px-4 rounded-xl"
            style={{
              backgroundColor: colors.primary,
              height: 48,
              width: 48
            }}
          >
            <Ionicons name="add" size={20} color="white" />
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