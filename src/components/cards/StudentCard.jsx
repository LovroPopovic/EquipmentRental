import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const StudentCard = ({ student, onPress, showLastActivity = true }) => {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={() => onPress(student)}
      className="p-4 rounded-xl mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-bold text-lg">
            {student.name.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-base mb-1" style={{ color: colors.text }}>
            {student.name}
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {student.email}
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            {student.borrowedCount} aktivnih posudbi
          </Text>
        </View>
        {showLastActivity && (
          <View className="items-end">
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Zadnja aktivnost
            </Text>
            <Text className="text-xs font-medium" style={{ color: colors.text }}>
              {student.lastActivity}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

export default StudentCard;