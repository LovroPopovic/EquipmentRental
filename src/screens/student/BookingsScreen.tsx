import React from 'react';
import { View, Text } from 'react-native';
import { StudentScreenProps } from '../../navigation/types';
import { useColors } from '../../hooks/useColors';

type Props = StudentScreenProps<'Bookings'>;

const BookingsScreen: React.FC<Props> = () => {
  const colors = useColors();

  return (
    <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
      <Text className="text-2xl font-bold" style={{ color: colors.text }}>
        Bookings Screen
      </Text>
    </View>
  );
};

export default BookingsScreen;