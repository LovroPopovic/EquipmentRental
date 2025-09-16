import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const BorrowingDetailScreen = ({ route, navigation }) => {
  const colors = useColors();
  const { borrowing } = route.params;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'borrowed':
        return '#ef4444';
      case 'returned':
        return '#22c55e';
      case 'overdue':
        return '#f59e0b';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'borrowed':
        return 'Posuđeno';
      case 'returned':
        return 'Vraćeno';
      case 'overdue':
        return 'Kasni s vraćanjem';
      default:
        return status;
    }
  };

  const handleContactStudent = () => {
    const student = {
      name: borrowing.student,
      email: `${borrowing.student.toLowerCase().replace(' ', '.')}@student.apu.hr`,
      borrowedCount: 1
    };

    Alert.alert(
      'Kontakt student',
      `Kontaktirajte ${borrowing.student}?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Chat',
          onPress: () => navigation.navigate('Chat', {
            otherUser: student,
            equipment: { name: borrowing.equipment }
          })
        },
        {
          text: 'Email',
          onPress: () => Alert.alert('Email', `Šaljete email na: ${student.email}`)
        },
        {
          text: 'Pozovi',
          onPress: () => Alert.alert('Poziv', 'Funkcija poziva bit će dodana uskoro.')
        }
      ]
    );
  };

  const handleMarkReturned = () => {
    if (borrowing.status === 'borrowed' || borrowing.status === 'overdue') {
      Alert.alert(
        'Označi kao vraćeno',
        `Označiti opremu "${borrowing.equipment}" kao vraćenu?`,
        [
          { text: 'Odustani', style: 'cancel' },
          {
            text: 'Označi',
            onPress: () => {
              Alert.alert('Uspjeh', 'Oprema je označena kao vraćena!');
              navigation.goBack();
            }
          }
        ]
      );
    }
  };

  const handleExtendBorrow = () => {
    if (borrowing.status === 'borrowed') {
      Alert.alert(
        'Produži posudbu',
        `Produžiti posudbu opreme "${borrowing.equipment}" za još 7 dana?`,
        [
          { text: 'Odustani', style: 'cancel' },
          {
            text: 'Produži',
            onPress: () => Alert.alert('Uspjeh', 'Posudba je produžena za 7 dana!')
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={handleBackPress} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          Detalji posudbe
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View
          className="mx-4 mt-4 mb-6 p-4 rounded-xl"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: getStatusColor(borrowing.status) + '40'
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: getStatusColor(borrowing.status) }}
              >
                <Ionicons
                  name={
                    borrowing.status === 'borrowed' ? 'arrow-up' :
                    borrowing.status === 'returned' ? 'arrow-down' : 'warning'
                  }
                  size={20}
                  color="white"
                />
              </View>
              <View>
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  {getStatusText(borrowing.status)}
                </Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  {borrowing.duration}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Equipment Info */}
        <View className="mx-4 mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Oprema
          </Text>

          <View className="flex-row items-center mb-3">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Ionicons name="construct" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                {borrowing.equipment}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                ID: #{borrowing.id}
              </Text>
            </View>
          </View>
        </View>

        {/* Student Info */}
        <View className="mx-4 mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Student
          </Text>

          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-bold text-lg">
                  {borrowing.student.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {borrowing.student}
                </Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  {borrowing.student.toLowerCase().replace(' ', '.')}@student.apu.hr
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleContactStudent}
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Ionicons name="chatbubble" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeline */}
        <View className="mx-4 mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Vremenska linija
          </Text>

          <View className="flex-row items-center mb-3">
            <View
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: '#22c55e' }}
            />
            <View className="flex-1">
              <Text className="text-sm font-medium" style={{ color: colors.text }}>
                Posuđeno
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {borrowing.borrowDate}
              </Text>
            </View>
          </View>

          {borrowing.returnDate ? (
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: '#22c55e' }}
              />
              <View className="flex-1">
                <Text className="text-sm font-medium" style={{ color: colors.text }}>
                  Vraćeno
                </Text>
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  {borrowing.returnDate}
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-3 border-2"
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
              />
              <View className="flex-1">
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  Čeka se povrat...
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Student Notes */}
        {borrowing.notes && (
          <View className="mx-4 mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
              Napomene studenta
            </Text>
            <Text className="text-sm italic" style={{ color: colors.textSecondary }}>
              "{borrowing.notes}"
            </Text>
          </View>
        )}

        {/* Staff Notes */}
        <View className="mx-4 mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Bilješke osoblja
          </Text>
          <TextInput
            placeholder="Dodajte interni komentar o ovoj posudbi (stanje opreme, problemi, napomene...)"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            className="p-3 rounded-lg text-sm mb-3"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              minHeight: 80,
              textAlignVertical: 'top'
            }}
            maxLength={500}
          />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Interno - vidljivo samo osoblju
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {borrowing.status !== 'returned' && (
        <View className="p-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleExtendBorrow}
              className="flex-1 mr-2 py-3 rounded-xl"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <Text className="text-center font-semibold" style={{ color: colors.text }}>
                Produži
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleMarkReturned}
              className="flex-1 ml-2 py-3 rounded-xl"
              style={{ backgroundColor: colors.success }}
            >
              <Text className="text-center font-bold text-white">
                Označi vraćeno
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BorrowingDetailScreen;