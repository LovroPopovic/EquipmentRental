import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';

const FilterTabs = ({
  filters,
  activeFilter,
  onFilterChange,
  getFilterCount,
  variant = 'default'
}) => {
  const colors = useColors();

  const tabPadding = variant === 'compact' ? 'py-2 px-3' : 'py-3 px-4';
  const textSize = variant === 'compact' ? 'text-xs' : 'text-sm';
  const marginRight = variant === 'compact' ? 'mr-1' : 'mr-2';

  return (
    <View className="flex-row">
      {filters.map((filter, index) => (
        <TouchableOpacity
          key={filter.key}
          onPress={() => onFilterChange(filter.key)}
          className={`flex-1 ${tabPadding} rounded-xl ${index < filters.length - 1 ? marginRight : ''}`}
          style={{
            backgroundColor: activeFilter === filter.key ? colors.primary : colors.surface,
            borderWidth: 1,
            borderColor: activeFilter === filter.key ? colors.primary : colors.border
          }}
        >
          <Text
            className={`text-center font-medium ${textSize}`}
            style={{
              color: activeFilter === filter.key ? 'white' : colors.text
            }}
          >
            {filter.label}
          </Text>
          {getFilterCount && (
            <Text
              className={`text-center ${variant === 'compact' ? 'text-xs' : 'text-xs'} mt-1`}
              style={{
                color: activeFilter === filter.key ? 'white' : colors.textSecondary
              }}
            >
              {getFilterCount(filter.key)}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FilterTabs;