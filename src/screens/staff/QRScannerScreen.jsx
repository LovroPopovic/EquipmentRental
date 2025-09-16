import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

// import { CameraView, useCameraPermissions } from 'expo-camera';

const QRScannerScreen = ({ navigation }) => {
  const colors = useColors();
  // const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // const isPermissionGranted = Boolean(permission?.granted);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert(
      'QR Kod skeniram',
      `Tip: ${type}\nPodaci: ${data}`,
      [
        {
          text: 'Skeniraj ponovno',
          onPress: () => setScanned(false)
        },
        {
          text: 'U redu',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const simulateScan = () => {
    handleBarCodeScanned({
      type: 'qr',
      data: 'EQUIPMENT_ID_12345'
    });
  };


  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          QR Scanner
        </Text>
      </View>

      {/* Mock QR Scanner */}
      <View className="flex-1 relative">
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#000' }}>
          <Ionicons name="qr-code-outline" size={120} color="#ffffff40" />
          <Text className="text-white text-center mb-4 mt-6">
            QR Scanner (Mock Mode)
          </Text>
          <Text className="text-white text-center mb-6 px-6 opacity-80">
            Kamera funkcionalnost je onemogućena za development
          </Text>
        </View>

        {/* Scanning overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
          </View>
        </View>

        {/* Instructions */}
        <View className="absolute bottom-0 left-0 right-0 p-6">
          <View
            className="p-4 rounded-xl"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          >
            <Text className="text-white text-center font-medium mb-2">
              Usmjerite QR kod u okvir
            </Text>
            <Text className="text-white text-center text-sm opacity-80">
              Skeniranje će se automatski pokrenuti kada se kod prepozna
            </Text>
          </View>

          {/* Simulation button */}
          <TouchableOpacity
            onPress={simulateScan}
            className="mt-3 px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-center font-semibold">
              Simuliraj skeniranje
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

export default QRScannerScreen;