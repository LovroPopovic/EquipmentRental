import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ImageBackground } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/AuthService';
import Svg, { Path } from 'react-native-svg';

// Component for APU Logo (will use theme colors)
const ApuLogo = ({ size = 60, color }) => (
  <Svg width={size} height={size * 0.47} viewBox="0 0 64 30">
    <Path fillRule="evenodd" clipRule="evenodd"
          d="M10.931 13.715 5.534.172 0 13.715h10.931Z" fill={color} />
    <Path d="M26.477 25.74h-4.501V30h4.5v-4.26Z" fill={color} />
    <Path fillRule="evenodd" clipRule="evenodd"
          d="M63.603 20.942a9.059 9.059 0 0 1-18.114 0V0h18.114v20.942ZM29.631.172a6.773 6.773 0 0 1 6.772 6.772 6.773 6.773 0 0 1-6.772 6.77l-3.155.001V.173h3.155Z"
          fill={color} />
  </Svg>
);

const LoginScreen = ({ navigation, onAuthChange }) => {
  const colors = useColors();
  const { isDark } = useTheme();

  /**
   * AAI@EduHr OIDC Login
   */
  const handleAAILogin = async () => {
    try {
      await authService.login();
      if (onAuthChange) {
        onAuthChange();
      }
    } catch (error) {
      Alert.alert('Greška prijave', error.message);
    }
  };

  /**
   * Development Login - Student
   */
  const handleDevStudentLogin = async () => {
    try {
      await authService.loginDev('student');
      if (onAuthChange) {
        onAuthChange();
      }
    } catch (error) {
      Alert.alert('Greška', 'Development student login failed');
    }
  };

  /**
   * Development Login - Staff
   */
  const handleDevStaffLogin = async () => {
    try {
      await authService.loginDev('staff');
      if (onAuthChange) {
        onAuthChange();
      }
    } catch (error) {
      Alert.alert('Greška', 'Development staff login failed');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/APURI-FOTKA-ZGRADA.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.85)' }]}>
        <View style={styles.contentContainer}>
          {/* APU Logo */}
          <View style={styles.logoContainer}>
            <ApuLogo color={colors.text} size={100} />
          </View>

          {/* Authentication section */}
          <View style={styles.authSection}>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: '#3B82F6' }]}
              onPress={handleAAILogin}
            >
              <Text style={styles.buttonText}>
                Prijavi se (AAI@EduHr)
              </Text>
            </TouchableOpacity>

            {/* Development options */}
            <View style={styles.devSection}>
              <Text style={[styles.devTitle, { color: colors.textSecondary }]}>
                Razvoj:
              </Text>
              <TouchableOpacity
                style={[styles.devButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleDevStudentLogin}
              >
                <Text style={[styles.devButtonText, { color: colors.text }]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.devButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleDevStaffLogin}
              >
                <Text style={[styles.devButtonText, { color: colors.text }]}>
                  Osoblje
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  authSection: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  devSection: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  devTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  devButton: {
    width: '60%',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;