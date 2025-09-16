import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const StatCard = ({ title, value, icon, color, onPress, size = 'normal' }) => {
  const colors = useColors();

  const cardPadding = size === 'small' ? 'p-3' : 'p-4';
  const iconSize = size === 'small' ? 16 : 20;
  const valueSize = size === 'small' ? 'text-xl' : 'text-2xl';
  const iconContainer = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 ${cardPadding} rounded-xl mx-1 mb-4`}
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View
          className={`${iconContainer} rounded-full items-center justify-center`}
          style={{ backgroundColor: color }}
        >
          <Ionicons name={icon} size={iconSize} color="white" />
        </View>
        <Text className={`${valueSize} font-bold`} style={{ color: colors.text }}>
          {value}
        </Text>
      </View>
      <Text className="text-sm" style={{ color: colors.textSecondary }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default StatCard;