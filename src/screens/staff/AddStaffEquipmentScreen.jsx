import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '../../hooks/useColors';
import { apiService } from '../../services/ApiService';

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
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([
    'laptop', 'camera', 'tablet', 'audio', 'video', 'lighting', 'tripod', 'monitor', 'projector', 'printer'
  ]);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [equipmentImages, setEquipmentImages] = useState([]);

  useEffect(() => {
    loadExistingCategories();

    // Load existing images if in edit mode
    if (isEditMode && editingEquipment?.imageUrl) {
      setEquipmentImages([{
        uri: editingEquipment.imageUrl,
        id: 'existing'
      }]);
    }
  }, []);

  const loadExistingCategories = async () => {
    try {
      const response = await apiService.getEquipment();
      const equipment = response.data || [];

      // Extract unique categories from existing equipment
      const existingCategories = [...new Set(equipment.map(item => item.category))]
        .filter(Boolean)
        .sort();

      // Merge with predefined categories
      const allCategories = [...new Set([...availableCategories, ...existingCategories])].sort();
      setAvailableCategories(allCategories);
    } catch (error) {
      console.log('Could not load existing categories:', error);
    }
  };

  const handleSelectCategory = (category) => {
    setFormData(prev => ({ ...prev, category }));
    setShowCategoryPicker(false);
  };

  const handleAddNewCategory = () => {
    if (!newCategoryText.trim()) {
      Alert.alert('Greška', 'Molimo unesite naziv kategorije.');
      return;
    }

    const newCategory = newCategoryText.trim().toLowerCase();

    if (availableCategories.includes(newCategory)) {
      Alert.alert('Greška', 'Ova kategorija već postoji.');
      return;
    }

    setAvailableCategories(prev => [...prev, newCategory].sort());
    setFormData(prev => ({ ...prev, category: newCategory }));
    setNewCategoryText('');
    setShowCategoryPicker(false);

    Alert.alert('Uspjeh', `Kategorija "${newCategory}" je dodana!`);
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Dozvola potrebna', 'Potrebna je dozvola za pristup galeriji slika.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          id: Date.now() + Math.random()
        }));
        setEquipmentImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške pri odabiru slika.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Dozvola potrebna', 'Potrebna je dozvola za pristup kameri.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        aspect: [4, 3],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets) {
        const newImage = {
          uri: result.assets[0].uri,
          id: Date.now()
        };
        setEquipmentImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške pri snimanju slike.');
    }
  };

  const removeImage = (imageId) => {
    setEquipmentImages(prev => prev.filter(img => img.id !== imageId));
  };

  const showImageOptions = () => {
    Alert.alert(
      'Dodaj sliku',
      'Odaberite opciju',
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Galerija', onPress: pickImage },
        { text: 'Kamera', onPress: takePhoto }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.category || !formData.location.trim()) {
      Alert.alert('Greška', 'Molimo unesite sva obavezna polja.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing equipment
        const updatedData = {
          name: formData.name.trim(),
          category: formData.category.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          // qrCode: formData.qrCode.trim() || null, // DISABLED
          imageUrl: equipmentImages.length > 0 ? equipmentImages[0].uri : editingEquipment?.imageUrl || null
        };

        await apiService.updateEquipment(editingEquipment.id, updatedData);

        Alert.alert(
          'Uspjeh',
          'Oprema je uspješno ažurirana!',
          [{ text: 'U redu', onPress: () => navigation.goBack() }]
        );
      } else {
        // Create new equipment
        const equipmentPayload = {
          name: formData.name.trim(),
          category: formData.category.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          // qrCode: formData.qrCode.trim() || null, // DISABLED
          imageUrl: equipmentImages.length > 0 ? equipmentImages[0].uri : null
        };

        await apiService.createEquipment(equipmentPayload);

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

  // QR Code generation - DISABLED
  /*
  const generateQRCode = () => {
    const qrCode = `APU_${Date.now()}`;
    setFormData(prev => ({ ...prev, qrCode }));
  };
  */

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
              onPress={() => setShowCategoryPicker(true)}
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

          {/* Equipment Images */}
          <View className="mb-6">
            <Text className="text-sm font-medium mb-3" style={{ color: colors.text }}>
              Slike opreme
            </Text>

            {/* Add Image Button */}
            <TouchableOpacity
              onPress={showImageOptions}
              className="mb-3 p-4 rounded-xl border-2 border-dashed items-center justify-center"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface + '50'
              }}
            >
              <Ionicons name="camera" size={32} color={colors.textSecondary} />
              <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
                Dodaj slike opreme
              </Text>
              <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Dotaknite za odabir iz galerije ili snimanje
              </Text>
            </TouchableOpacity>

            {/* Image Grid */}
            {equipmentImages.length > 0 && (
              <View className="flex-row flex-wrap">
                {equipmentImages.map((image, index) => (
                  <View key={image.id} className="w-1/3 p-1">
                    <View className="relative">
                      <Image
                        source={{ uri: image.uri }}
                        className="w-full aspect-square rounded-lg"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Technical Details */}
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Tehnički detalji
          </Text>

          {/* QR Code - DISABLED */}
          {/*
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
          */}

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

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background, maxHeight: '80%' }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                Odaberite kategoriju
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Add New Category */}
            <View className="mb-4 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                Dodaj novu kategoriju
              </Text>
              <View className="flex-row">
                <TextInput
                  placeholder="Naziv nove kategorije"
                  placeholderTextColor={colors.textSecondary}
                  value={newCategoryText}
                  onChangeText={setNewCategoryText}
                  className="flex-1 p-3 rounded-lg text-base mr-2"
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                />
                <TouchableOpacity
                  onPress={handleAddNewCategory}
                  className="px-4 py-3 rounded-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Existing Categories */}
            <Text className="text-sm font-medium mb-3" style={{ color: colors.text }}>
              Postojeće kategorije
            </Text>
            <FlatList
              data={availableCategories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectCategory(item)}
                  className="p-4 rounded-xl mb-2 flex-row items-center justify-between"
                  style={{
                    backgroundColor: formData.category === item ? colors.primary + '20' : colors.surface,
                    borderWidth: 1,
                    borderColor: formData.category === item ? colors.primary : colors.border
                  }}
                >
                  <Text
                    className="text-base capitalize"
                    style={{
                      color: formData.category === item ? colors.primary : colors.text,
                      fontWeight: formData.category === item ? '600' : 'normal'
                    }}
                  >
                    {item}
                  </Text>
                  {formData.category === item && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddStaffEquipmentScreen;