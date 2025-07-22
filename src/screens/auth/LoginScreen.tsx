import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { AuthStackScreenProps } from '../../navigation/types';
import { useColors } from '../../hooks/useColors';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Path } from 'react-native-svg';

type Props = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = () => {
  const colors = useColors();
  const { isDark } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // APU Logo SVG Component
  const ApuLogo = ({ size = 48, color = colors.text }) => (
    <Svg width={size} height={size * 0.47} viewBox="0 0 64 30">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.931 13.715 5.534.172 0 13.715h10.931Z"
        fill={color}
      />
      <Path
        d="M26.477 25.74h-4.501V30h4.5v-4.26Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M63.603 20.942a9.059 9.059 0 0 1-18.114 0V0h18.114v20.942ZM29.631.172a6.773 6.773 0 0 1 6.772 6.772 6.773 6.773 0 0 1-6.772 6.77l-3.155.001V.173h3.155Z"
        fill={color}
      />
    </Svg>
  );

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Greška', 'Molimo unesite korisničko ime i lozinku');
      return;
    }

    setIsLoading(true);
    
    // Mock authentication logic
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock user roles based on username
      if (username.toLowerCase().includes('admin') || username.toLowerCase().includes('profesor') || username.toLowerCase().includes('asistent')) {
        // Navigate to staff interface
        Alert.alert('Uspjeh', 'Prijavljeni ste kao osoblje');
        // TODO: Navigate to staff interface when navigation is ready
      } else {
        // Navigate to student interface
        Alert.alert('Uspjeh', 'Prijavljeni ste kao student');
        // TODO: Navigate to student interface when navigation is ready
      }
    }, 1000);
  };


  return (
    <View className="flex-1">
      <ImageBackground
        source={require('../../assets/images/APURI-FOTKA-ZGRADA.jpg')}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Dark overlay for better text readability */}
        <View 
          className="flex-1"
          style={{ 
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.85)'
          }}
        >
          <View className="flex-1 justify-center px-8">
        
        {/* Header */}
        <View className="items-center mb-8">
          <Text 
            className="text-lg font-bold" 
            style={{ color: colors.text }}
          >
            Prijava pomoću AAI@EduHr računa
          </Text>
        </View>

        {/* Login Form */}
        <View className="mb-8">
          <View className="mb-4">
            <TextInput
              className="w-full px-4 py-4"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000000',
                borderRadius: 25
              }}
              placeholder="e-mail adresa"
              placeholderTextColor="#666666"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mb-6">
            <TextInput
              className="w-full px-4 py-4"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000000',
                borderRadius: 25
              }}
              placeholder="lozinka"
              placeholderTextColor="#666666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="w-full py-4 items-center mb-6"
            style={{ 
              backgroundColor: '#FF3333',
              borderRadius: 25
            }}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-base">
              {isLoading ? 'Prijavljivanje...' : 'Prijava'}
            </Text>
          </TouchableOpacity>

          {/* Guest Login Link */}
          <TouchableOpacity 
            className="items-center py-3 px-6"
            style={{
              borderWidth: 1,
              borderColor: colors.text,
              borderRadius: 25
            }}
          >
            <View className="flex-row items-center">
              <Text 
                className="text-base mr-2" 
                style={{ color: colors.text }}
              >
                Prijava za goste
              </Text>
              <Text 
                className="text-base" 
                style={{ color: colors.text }}
              >
                →
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Icons */}
        <View className="items-center">
          <View className="items-center justify-center">
            {/* APU Logo - Center position */}
            <View 
              className="items-center justify-center w-20 h-20 rounded-full" 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <ApuLogo size={60} color={colors.text} />
            </View>
          </View>
        </View>

          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;