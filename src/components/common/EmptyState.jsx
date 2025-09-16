import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const EmptyState = ({
  icon = 'document-outline',
  title = 'Nema podataka',
  description = 'Nema podataka za prikaz.',
  children
}) => {
  const colors = useColors();

  return (
    <View className="items-center py-12 px-6">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: colors.surface }}
      >
        <Ionicons name={icon} size={24} color={colors.textSecondary} />
      </View>
      <Text
        className="text-base font-medium mb-2 text-center"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      <Text
        className="text-sm text-center"
        style={{ color: colors.textSecondary }}
      >
        {description}
      </Text>
      {children}
    </View>
  );
};

export default EmptyState;