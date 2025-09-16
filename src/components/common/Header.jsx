import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const Header = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showBorder = true,
  children
}) => {
  const colors = useColors();

  return (
    <View
      className="px-6 py-4 flex-row items-center justify-between"
      style={showBorder ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}}
    >
      <View className="flex-row items-center flex-1">
        {leftIcon && (
          <TouchableOpacity onPress={onLeftPress} className="mr-4">
            <Ionicons name={leftIcon} size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {children}

      {rightIcon && (
        <TouchableOpacity onPress={onRightPress}>
          <Ionicons name={rightIcon} size={24} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;