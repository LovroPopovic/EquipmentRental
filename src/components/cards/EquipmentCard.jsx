import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const EquipmentCard = ({ item, onPress, showOwner = true, compact = false }) => {
  const colors = useColors();

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Kamere': return 'camera';
      case 'Stativni': return 'camera-outline';
      case 'Tableti': return 'tablet-portrait';
      case 'Studijski': return 'business';
      case 'Računala': return 'laptop';
      default: return 'hardware-chip';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        className="p-3 rounded-lg mb-2"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: item.available ? '#22c55e' : '#ef4444' }}
          >
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={16}
              color="white"
            />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-sm" style={{ color: colors.text }}>
              {item.name}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {item.category} • {item.available ? 'Dostupno' : 'Posuđeno'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
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
            name={getCategoryIcon(item.category)}
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
          {showOwner && item.owner && (
            <Text className="text-xs mt-1" style={{ color: colors.primary }}>
              Vlasnik: {item.owner.name}
            </Text>
          )}
        </View>
        <View className="items-end">
          <View
            className="w-3 h-3 rounded-full mb-2"
            style={{ backgroundColor: item.available ? colors.success : colors.warning }}
          />
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EquipmentCard;