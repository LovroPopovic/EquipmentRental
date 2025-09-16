import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Pretraži...',
  onClear,
  style,
  containerStyle
}) => {
  const colors = useColors();

  return (
    <View
      className="flex-row items-center px-4 py-3 rounded-xl"
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border
        },
        containerStyle
      ]}
    >
      <Ionicons name="search" size={20} color={colors.textSecondary} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 ml-3 text-base"
        style={[{ color: colors.text }, style]}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onChangeText(''))}>
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;