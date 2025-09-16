import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { mockCategories, addEquipment, updateEquipment } from '../../data/mockData';

const AddStaffEquipmentScreen = ({ navigation, route }) => {
  const colors = useColors();
  const isEditMode = route?.params?.isEditMode || false;
  const editingEquipment = route?.params?.equipment;

  const [formData, setFormData] = useState({
    name: editingEquipment?.name || '',
    category: editingEquipment?.category || '',
    description: editingEquipment?.description || '',
    location: editingEquipment?.location || '',
    qrCode: editingEquipment?.qrCode || '',
    serialNumber: editingEquipment?.serialNumber || '',
    purchaseDate: editingEquipment?.purchaseDate || '',
    condition: editingEquipment?.condition || 'excellent',
    notes: editingEquipment?.notes || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.category || !formData.location.trim()) {
      Alert.alert('Greška', 'Molimo unesite sva obavezna polja.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing equipment with staff-specific fields
        const updatedData = {
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          notes: formData.notes.trim()
        };

        updateEquipment(editingEquipment.id, updatedData);

        Alert.alert(
          'Uspjeh',
          'Oprema je uspješno ažurirana!',
          [{ text: 'U redu', onPress: () => navigation.goBack() }]
        );
      } else {
        // Create new equipment with staff-specific fields
        const equipmentPayload = {
          id: Date.now(),
          name: formData.name.trim(),
          category: formData.category,
          description: formData.description.trim(),
          location: formData.location.trim(),
          imageUrl: null,
          available: true,
          borrower: null,
          owner: null, // University equipment
          qrCode: formData.qrCode.trim() || `QR_${Date.now()}`,
          serialNumber: formData.serialNumber.trim(),
          purchaseDate: formData.purchaseDate.trim(),
          condition: formData.condition,
          notes: formData.notes.trim()
        };

        addEquipment(equipmentPayload);

        Alert.alert(
          'Uspjeh',
          'Oprema je uspješno dodana u sustav!',
          [{ text: 'U redu', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške. Molimo pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateQRCode = () => {
    const qrCode = `APU_${Date.now()}`;
    setFormData(prev => ({ ...prev, qrCode }));
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          {isEditMode ? 'Uredi opremu' : 'Dodaj opremu'}
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Basic Information */}
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Osnovne informacije
          </Text>

          {/* Equipment Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Naziv opreme *
            </Text>
            <TextInput
              placeholder="Unesite naziv opreme"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              className="p-4 rounded-xl text-base"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Kategorija *
            </Text>
            <TouchableOpacity
              className="p-4 rounded-xl flex-row items-center justify-between"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ color: formData.category ? colors.text : colors.textSecondary }}>
                {formData.category || 'Odaberite kategoriju'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Lokacija *
            </Text>
            <TextInput
              placeholder="Unesite lokaciju opreme"
              placeholderTextColor={colors.textSecondary}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              className="p-4 rounded-xl text-base"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Opis
            </Text>
            <TextInput
              placeholder="Unesite opis opreme"
              placeholderTextColor={colors.textSecondary}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              className="p-4 rounded-xl text-base"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* Technical Details */}
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Tehnički detalji
          </Text>

          {/* QR Code */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              QR Kod
            </Text>
            <View className="flex-row">
              <TextInput
                placeholder="QR kod se generira automatski"
                placeholderTextColor={colors.textSecondary}
                value={formData.qrCode}
                onChangeText={(text) => setFormData(prev => ({ ...prev, qrCode: text }))}
                className="flex-1 p-4 rounded-xl text-base mr-2"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text
                }}
              />
              <TouchableOpacity
                onPress={generateQRCode}
                className="px-4 py-4 rounded-xl"
                style={{ backgroundColor: colors.primary }}
              >
                <Ionicons name="qr-code" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Serial Number */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Serijski broj
            </Text>
            <TextInput
              placeholder="Unesite serijski broj"
              placeholderTextColor={colors.textSecondary}
              value={formData.serialNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, serialNumber: text }))}
              className="p-4 rounded-xl text-base"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </View>

          {/* Purchase Date */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Datum nabave
            </Text>
            <TextInput
              placeholder="DD.MM.YYYY"
              placeholderTextColor={colors.textSecondary}
              value={formData.purchaseDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, purchaseDate: text }))}
              className="p-4 rounded-xl text-base"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </View>

          {/* Condition */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Stanje opreme
            </Text>
            <View className="flex-row">
              {[
                { key: 'excellent', label: 'Izvrsno' },
                { key: 'good', label: 'Dobro' },
                { key: 'fair', label: 'Korektno' },
                { key: 'poor', label: 'Loše' }
              ].map(condition => (
                <TouchableOpacity
                  key={condition.key}
                  onPress={() => setFormData(prev => ({ ...prev, condition: condition.key }))}
                  className="flex-1 py-3 px-2 rounded-xl mr-2"
                  style={{
                    backgroundColor: formData.condition === condition.key ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: formData.condition === condition.key ? colors.primary : colors.border
                  }}
                >
                  <Text
                    className="text-center font-medium text-xs"
                    style={{
                      color: formData.condition === condition.key ? 'white' : colors.text
                    }}
                  >
                    {condition.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Staff Notes */}
          <View className="mb-6">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Napomene osoblja
            </Text>
            <TextInput
              placeholder="Interne napomene o opremi"
              placeholderTextColor={colors.textSecondary}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
              className="p-4 rounded-xl text-base"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                textAlignVertical: 'top'
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="py-4 rounded-xl"
          style={{
            backgroundColor: isSubmitting ? colors.border : colors.primary,
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          <Text className="text-center text-lg font-bold text-white">
            {isSubmitting
              ? (isEditMode ? 'Ažuriram...' : 'Dodajem...')
              : (isEditMode ? 'Ažuriraj opremu' : 'Dodaj opremu')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddStaffEquipmentScreen;