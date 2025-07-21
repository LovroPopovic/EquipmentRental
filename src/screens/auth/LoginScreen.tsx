import React from 'react';
import { View, Text } from 'react-native';
import { AuthStackScreenProps } from '../../navigation/types';
import { useColors } from '../../hooks/useColors';

type Props = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = () => {
  const colors = useColors();

  return (
    <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
      <Text className="text-2xl font-bold" style={{ color: colors.text }}>
        Login Screen
      </Text>
    </View>
  );
};

export default LoginScreen;