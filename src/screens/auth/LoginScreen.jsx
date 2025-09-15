import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ImageBackground } from 'react-native';
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

const LoginScreen = () => {
  const colors = useColors();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState(null);

  /**
   * Initiates AAI@EduHr login process.
   * Handles success, errors, and navigation/role display.
   */
  const handleAaiLogin = async () => {
    setLoading(true);
    setLoggedInRole(null);

    try {
      // Call AAI@EduHr authentication service
      const authResult = await authService.loginWithAai();

      if (authResult) {
        // Get parsed user info from storage
        const userInfo = await authService.getUserInfo();

        if (userInfo) {
          // Temporary role display on screen (for testing)
          setLoggedInRole(userInfo.rawRoles.join(', '));
          
          // Here we would normally do redirection, but for AAI flow testing we just display the role
          // Example navigation for future phases:
          // const isStudent = userInfo.rawRoles.includes('student');
          // const isStaff = userInfo.rawRoles.some(role => ['djelatnik', 'nastavnik', 'admin'].includes(role));

          // if (isStudent && !isStaff) {
          //   navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'StudentApp' }] }));
          // } else if (isStaff) {
          //   navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'StaffApp' }] }));
          // } else {
          //   Alert.alert('Uloga neprepoznata', 'Vaša uloga nije prepoznata. Molimo kontaktirajte administratora.');
          //   await authService.logoutAai();
          // }
        } else {
          // Although authResult was successful, userInfo couldn't be retrieved - anomaly
          throw new Error('User information could not be retrieved after successful authentication.');
        }
      }
    } catch (error) {
      console.error('AAI Login Error:', error.message, error.code, error.data);
      // Standardized error messages
      let errorMessage = 'Prijava neuspješna. Pokušajte ponovno.';
      if (error.code === 'error.browser_returned_error') {
        errorMessage = 'Prijava je otkazana ili neuspješna u pregledniku.';
      } else if (error.message.includes('NoAccessToken')) {
        errorMessage = 'Autentifikacija nije vratila pristupni token.';
      } else if (error.message.includes('Invalid or unreadable ID token')) {
        errorMessage = 'Greška s korisničkim podacima nakon prijave.';
      }
      Alert.alert('Greška pri prijavi', errorMessage);
      setLoggedInRole('GREŠKA: ' + errorMessage);
    } finally {
      setLoading(false);
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
            <Text style={[styles.loginPrompt, { color: colors.text }]}>
              Prijavite se putem AAI@EduHr računa
            </Text>

            <TouchableOpacity
              style={[styles.aaiLoginButton, { backgroundColor: colors.primary }]}
              onPress={handleAaiLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.aaiLoginButtonText}>
                  Prijava
                </Text>
              )}
            </TouchableOpacity>

            {/* Section for role display after login */}
            {loggedInRole && (
              <Text style={[styles.roleDisplay, { color: colors.text }]}>
                Uloga: {loggedInRole}
              </Text>
            )}

            {/* Guest login option - according to Figma design */}
            <TouchableOpacity
              style={[styles.guestLoginButton, { borderColor: colors.text }]}
              onPress={() => Alert.alert('Gost Prijava', 'Funkcionalnost prijave za goste nije implementirana u ovoj fazi.')}
            >
              <View style={styles.guestButtonContent}>
                <Text style={[styles.guestLoginButtonText, { color: colors.text }]}>
                  Prijava za goste
                </Text>
                <Text style={[styles.guestLoginButtonText, { color: colors.text }]}>
                  →
                </Text>
              </View>
            </TouchableOpacity>
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
  loginPrompt: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  aaiLoginButton: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  aaiLoginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleDisplay: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  guestLoginButton: {
    width: '80%',
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  guestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestLoginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;