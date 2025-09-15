import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { mockEquipment } from '../../data/mockData';

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

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = mockEquipment.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEquipment(filtered);
  };

  const handleEquipmentPress = (equipment) => {
    navigation.navigate('EquipmentDetail', { equipment });
  };

  const renderEquipmentItem = ({ item }) => (
    <EquipmentCard item={item} colors={colors} onPress={handleEquipmentPress} />
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />
      
      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
          Početna
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
            onPress={() => {
              // TODO: Open filter modal or navigate to filter screen
            }}
            className="items-center justify-center px-4 rounded-xl"
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
      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentItem}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;