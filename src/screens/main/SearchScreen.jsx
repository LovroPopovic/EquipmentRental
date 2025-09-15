import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, TextInput, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { mockEquipment, mockCategories } from '../../data/mockData';

const SearchScreen = ({ navigation }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, unavailable
  const [ownerFilter, setOwnerFilter] = useState('all'); // all, university, private
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEquipment, setFilteredEquipment] = useState(mockEquipment);

  useEffect(() => {
    filterEquipment();
  }, [searchQuery, selectedCategory, availabilityFilter, ownerFilter]);

  const filterEquipment = () => {
    let filtered = mockEquipment;

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
      filtered = filtered.filter(item => item.available);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(item => !item.available);
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
      {/* Equipment Icon */}
      <View
        className="w-16 h-16 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: colors.background }}
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
          size={24}
          color={colors.textSecondary}
        />
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
            <View
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: item.available ? colors.success : colors.warning }}
            />
            <Text
              className="text-xs"
              style={{ color: item.available ? colors.success : colors.warning }}
            >
              {item.available ? 'Dostupno' : 'Rezervirano'}
            </Text>
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
                {mockCategories.map(category => (
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