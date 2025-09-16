import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const ActivityCard = ({ activity, onPress, variant = 'default' }) => {
  const colors = useColors();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'borrowed': return 'arrow-up';
      case 'returned': return 'arrow-down';
      case 'overdue': return 'warning';
      default: return 'time';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'borrowed': return '#ef4444';
      case 'returned': return '#22c55e';
      case 'overdue': return '#f59e0b';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (type) => {
    switch (type) {
      case 'borrowed': return 'Posuđeno';
      case 'returned': return 'Vraćeno';
      case 'overdue': return 'Kasni';
      default: return type;
    }
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={() => onPress(activity)}
        className="p-3 rounded-lg mb-2"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <View className="flex-row items-center">
          <View
            className="w-6 h-6 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: getActivityColor(activity.type || activity.status) }}
          >
            <Ionicons
              name={getActivityIcon(activity.type || activity.status)}
              size={12}
              color="white"
            />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-sm" style={{ color: colors.text }}>
              {activity.equipment}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {activity.student} • {activity.date || activity.borrowDate}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(activity)}
      className="p-4 rounded-xl mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row items-start">
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-1"
          style={{ backgroundColor: getActivityColor(activity.type || activity.status) }}
        >
          <Ionicons
            name={getActivityIcon(activity.type || activity.status)}
            size={16}
            color="white"
          />
        </View>
        <View className="flex-1">
          <Text className="font-semibold mb-1" style={{ color: colors.text }}>
            {activity.equipment}
          </Text>
          <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
            {getStatusText(activity.type || activity.status)} • {activity.student}
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {activity.date || activity.borrowDate}
          </Text>
          {activity.notes && (
            <Text className="text-xs mt-2 italic" style={{ color: colors.textSecondary }}>
              "{activity.notes}"
            </Text>
          )}
        </View>
        <View className="items-end">
          {activity.duration && (
            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
              {activity.duration}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ActivityCard;