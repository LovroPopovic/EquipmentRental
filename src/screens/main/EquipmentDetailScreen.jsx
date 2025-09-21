import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, Modal, TextInput, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { Calendar } from 'react-native-calendars';
import { authService } from '../../services/AuthService';
import { apiService } from '../../services/ApiService';
import { useBooking } from '../../context/BookingContext';

const DateRangePicker = ({ colors, onDateSelect, selectedDates, onClose, equipment, onBookingCreated }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [startDate, setStartDate] = useState(selectedDates.start || null);
  const [endDate, setEndDate] = useState(selectedDates.end || null);
  const [autoReturnMode, setAutoReturnMode] = useState(false);
  const [autoReturnDays, setAutoReturnDays] = useState(7); // Default 7 days

  // Get blocked dates for this equipment (when it's already booked)
  const getBlockedDates = () => {
    const blocked = {};

    // If equipment is currently borrowed, block until return date
    if (equipment.borrower && equipment.borrower.borrowedUntil) {
      const today = new Date().toISOString().split('T')[0];
      const borrowedUntil = equipment.borrower.borrowedUntil;

      let currentDate = new Date(today);
      const endDate = new Date(borrowedUntil);

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        blocked[dateString] = {
          disabled: true,
          disableTouchEvent: true,
          color: '#ff6b6b',
          textColor: 'white'
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

      return blocked;
  };

  // Initialize calendar with blocked dates when component mounts
  useEffect(() => {
    const initialMarkedDates = { ...getBlockedDates() };

    // Add selected dates if they exist
    if (startDate && endDate) {
      const selectedMarked = createDateRange(startDate, endDate);
      Object.assign(initialMarkedDates, selectedMarked);
    } else if (startDate) {
      initialMarkedDates[startDate] = {
        ...initialMarkedDates[startDate],
        startingDay: true,
        endingDay: true,
        color: colors.primary,
        textColor: 'white'
      };
    }

    setMarkedDates(initialMarkedDates);
  }, []);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Nije odabrano';
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const createDateRange = (start, end) => {
    const marked = {};
    const startMoment = new Date(start);
    const endMoment = new Date(end);
    
    let current = new Date(startMoment);
    
    while (current <= endMoment) {
      const dateString = current.toISOString().split('T')[0];
      
      if (dateString === start && dateString === end) {
        marked[dateString] = {
          startingDay: true,
          endingDay: true,
          color: colors.primary,
          textColor: 'white'
        };
      } else if (dateString === start) {
        marked[dateString] = {
          startingDay: true,
          color: colors.primary,
          textColor: 'white'
        };
      } else if (dateString === end) {
        marked[dateString] = {
          endingDay: true,
          color: colors.primary,
          textColor: 'white'
        };
      } else {
        marked[dateString] = {
          color: colors.primary + '30',
          textColor: colors.text
        };
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return marked;
  };

  const onDayPress = (day) => {
    const selectedDate = day.dateString;
    const blockedDates = getBlockedDates();

    // Check if the selected date is blocked
    if (blockedDates[selectedDate]) {
      Alert.alert(
        'Datum nije dostupan',
        'Oprema je već rezervirana za odabrani datum.'
      );
      return;
    }

    if (autoReturnMode) {
      // Auto return mode - calculate end date automatically
      setStartDate(selectedDate);
      const startDateObj = new Date(selectedDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(endDateObj.getDate() + autoReturnDays);
      const calculatedEndDate = endDateObj.toISOString().split('T')[0];

      setEndDate(calculatedEndDate);
      const rangeMarked = createDateRange(selectedDate, calculatedEndDate);
      const newMarked = { ...blockedDates, ...rangeMarked };
      setMarkedDates(newMarked);
    } else {
      // Manual mode - existing logic
      if (startDate && !endDate) {
        const start = new Date(Math.min(new Date(startDate), new Date(selectedDate)));
        const end = new Date(Math.max(new Date(startDate), new Date(selectedDate)));

        let current = new Date(start);
        while (current <= end) {
          const dateString = current.toISOString().split('T')[0];
          if (blockedDates[dateString]) {
            Alert.alert(
              'Raspon uključuje blokirane datume',
              'Odabrani period uključuje datume kada je oprema već rezervirana.'
            );
            return;
          }
          current.setDate(current.getDate() + 1);
        }
      }

      if (!startDate || (startDate && endDate)) {
        setStartDate(selectedDate);
        setEndDate(null);
        const newMarked = { ...blockedDates };
        newMarked[selectedDate] = {
          startingDay: true,
          endingDay: true,
          color: colors.primary,
          textColor: 'white'
        };
        setMarkedDates(newMarked);
      } else if (startDate && !endDate) {
        let newStartDate = startDate;
        let newEndDate = selectedDate;

        if (new Date(selectedDate) < new Date(startDate)) {
          newStartDate = selectedDate;
          newEndDate = startDate;
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
        const rangeMarked = createDateRange(newStartDate, newEndDate);
        const newMarked = { ...blockedDates, ...rangeMarked };
        setMarkedDates(newMarked);
      }
    }
  };

  const handleConfirm = async () => {
    if (startDate && endDate) {
      onDateSelect({ start: startDate, end: endDate });

      Alert.alert(
        'Potvrda rezervacije',
        `Rezervirati ${equipment.name} od ${formatDateForDisplay(startDate)} do ${formatDateForDisplay(endDate)}?`,
        [
          { text: 'Odustani', style: 'cancel' },
          {
            text: 'Rezerviraj',
            onPress: async () => {
              try {
                console.log('📝 Creating booking...');
                const bookingData = {
                  equipmentId: equipment.id,
                  startDate: startDate,
                  endDate: endDate,
                  notes: `Booking for ${equipment.name}`
                };

                console.log('📊 Booking data:', bookingData);

                const response = await apiService.createBooking(bookingData);
                console.log('✅ Booking created:', response);

                // Trigger global refresh for all booking-related screens
                onBookingCreated();

                Alert.alert('Uspjeh', 'Oprema je uspješno rezervirana!');
                onClose();
              } catch (error) {
                console.error('❌ Failed to create booking:', error);
                Alert.alert('Greška', 'Nije moguće rezervirati opremu. Pokušajte ponovno.');
              }
            }
          }
        ]
      );
    }
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setMarkedDates({});
  };

  React.useEffect(() => {
    if (startDate && endDate) {
      setMarkedDates(createDateRange(startDate, endDate));
    }
  }, []);

  return (
    <View className="rounded-t-3xl" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between p-6 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Odaberite datume
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View className="px-6 py-4">
        {/* Calendar Mode Toggle */}
        <View className="mb-4 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-sm font-medium mb-3" style={{ color: colors.text }}>
            Način odabira datuma
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setAutoReturnMode(false)}
              className="flex-1 mr-2 py-2 px-3 rounded-lg"
              style={{
                backgroundColor: !autoReturnMode ? colors.primary : colors.background,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text
                className="text-center text-sm font-medium"
                style={{ color: !autoReturnMode ? 'white' : colors.text }}
              >
                Ručno
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAutoReturnMode(true)}
              className="flex-1 ml-2 py-2 px-3 rounded-lg"
              style={{
                backgroundColor: autoReturnMode ? colors.primary : colors.background,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text
                className="text-center text-sm font-medium"
                style={{ color: autoReturnMode ? 'white' : colors.text }}
              >
                Automatski
              </Text>
            </TouchableOpacity>
          </View>

          {autoReturnMode && (
            <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text className="text-xs mb-2" style={{ color: colors.textSecondary }}>
                Automatski vraćaj nakon {autoReturnDays} dana
              </Text>
              <View className="flex-row items-center justify-between">
                {[3, 7, 14].map(days => (
                  <TouchableOpacity
                    key={days}
                    onPress={() => setAutoReturnDays(days)}
                    className="flex-1 mx-1 py-2 rounded-lg"
                    style={{
                      backgroundColor: autoReturnDays === days ? colors.primary + '20' : colors.background,
                      borderWidth: 1,
                      borderColor: autoReturnDays === days ? colors.primary : colors.border
                    }}
                  >
                    <Text
                      className="text-center text-xs"
                      style={{
                        color: autoReturnDays === days ? colors.primary : colors.text,
                        fontWeight: autoReturnDays === days ? '600' : 'normal'
                      }}
                    >
                      {days} dana
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className="flex-row justify-between p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
          <View className="flex-1">
            <Text className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
              Početni datum
            </Text>
            <Text className="text-base font-semibold" style={{ color: startDate ? colors.text : colors.textSecondary }}>
              {formatDateForDisplay(startDate)}
            </Text>
          </View>
          <View className="w-px mx-4" style={{ backgroundColor: colors.border }} />
          <View className="flex-1">
            <Text className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
              Završni datum
            </Text>
            <Text className="text-base font-semibold" style={{ color: endDate ? colors.text : colors.textSecondary }}>
              {formatDateForDisplay(endDate)} {autoReturnMode && '(auto)'}
            </Text>
          </View>
        </View>
      </View>

      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType="period"
        minDate={new Date().toISOString().split('T')[0]}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: 'white',
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary,
          dotColor: colors.primary,
          selectedDotColor: 'white',
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          indicatorColor: colors.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
        }}
      />

      <View className="p-6 flex-row">
        <TouchableOpacity
          onPress={handleClear}
          className="flex-1 mr-3 py-4 rounded-xl items-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Obriši
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!startDate || !endDate}
          className="flex-1 ml-3 py-4 rounded-xl items-center"
          style={{ 
            backgroundColor: (startDate && endDate) ? colors.primary : colors.border,
            opacity: (startDate && endDate) ? 1 : 0.5 
          }}
        >
          <Text className="text-base font-bold text-white">
            Rezerviraj
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EquipmentDetailScreen = ({ route, navigation }) => {
  const colors = useColors();
  const [equipment, setEquipment] = useState(route.params.equipment);
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userBooking, setUserBooking] = useState(null);
  const { triggerRefresh, refreshTrigger } = useBooking();
  const lastRefreshTrigger = useRef(0);

  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [equipmentImages, setEquipmentImages] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  // Refresh equipment data from API
  const refreshEquipment = async () => {
    try {
      console.log('🔄 Refreshing equipment data...');
      const response = await apiService.getEquipmentById(equipment.id);
      setEquipment(response);

      // Check if current user has a booking for this equipment
      if (currentUser) {
        const booking = response.bookings?.find(booking =>
          booking.userId === currentUser.userId &&
          ['PENDING', 'APPROVED', 'ACTIVE'].includes(booking.status)
        );
        setUserBooking(booking);
        console.log('📋 User booking status:', booking ? booking.status : 'None');
      }

      console.log('✅ Equipment data refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh equipment:', error);
    }
  };

  // Load current user
  const loadCurrentUser = async () => {
    try {
      const userInfo = await authService.getUserInfo();
      if (userInfo) {
        const userData = userInfo.backendUser || userInfo;
        let userId = userData.id || userData.userId;

        if (!userId && userData.sub) {
          userId = userData.sub.startsWith('dev_') ? `mock_user_${userData.sub.split('_').pop()}` : userData.sub;
        }

        setCurrentUser({ ...userData, userId });
        console.log('👤 Current user loaded:', userId);
      }
    } catch (error) {
      console.error('❌ Failed to load current user:', error);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Kamere': return 'camera';
      case 'Stativni': return 'camera-outline';
      case 'Tableti': return 'tablet-portrait';
      case 'Studijski': return 'business';
      case 'Računala': return 'laptop';
      default: return 'hardware-chip';
    }
  };

  const getRelatedEquipment = (category) => {
    // Mock related equipment logic
    const relatedMap = {
      'Kamere': ['Stativni', 'Studijski'],
      'Stativni': ['Kamere', 'Studijski'],
      'Tableti': ['Računala'],
      'Studijski': ['Kamere', 'Stativni'],
      'Računala': ['Tableti']
    };

    const relatedCategories = relatedMap[category] || [];

    // Mock equipment suggestions (in real app, this would come from API)
    const suggestions = [
      { id: 'r1', name: 'Manfrotto Tripod', category: 'Stativni', available: true },
      { id: 'r2', name: 'Canon 50mm Lens', category: 'Kamere', available: false },
      { id: 'r3', name: 'Studio Light Kit', category: 'Studijski', available: true },
      { id: 'r4', name: 'iPad Pro 11"', category: 'Tableti', available: true },
      { id: 'r5', name: 'USB-C Hub', category: 'Računala', available: true }
    ];

    return suggestions
      .filter(item => relatedCategories.includes(item.category))
      .slice(0, 4); // Show max 4 suggestions
  };

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const userInfo = await authService.getUserInfo();
        const isOwner = equipment.owner &&
          (userInfo?.email === equipment.owner.email ||
           userInfo?.displayName === equipment.owner.name);
        setIsCurrentUserOwner(isOwner);
      } catch (error) {
        console.log('Error checking ownership:', error);
      }
    };

    checkOwnership();
    loadCurrentUser();
  }, [equipment]);

  // Listen for booking changes and refresh equipment data
  useEffect(() => {
    if (refreshTrigger > 0 && refreshTrigger !== lastRefreshTrigger.current && currentUser) {
      console.log('🔄 EquipmentDetailScreen: Refreshing due to booking change');
      lastRefreshTrigger.current = refreshTrigger;
      refreshEquipment();
    }
  }, [refreshTrigger, currentUser]);

  // Process equipment images
  useEffect(() => {
    const processImages = () => {
      const images = [];

      // Handle equipment images - check if it's JSON array or single URL
      if (equipment.imageUrl) {
        try {
          // Try to parse as JSON array first
          const imageArray = JSON.parse(equipment.imageUrl);
          if (Array.isArray(imageArray)) {
            // Multiple images stored as JSON array
            imageArray.forEach((uri, index) => {
              images.push({
                id: `image_${index}`,
                uri,
                title: `${equipment.name} ${index + 1}`
              });
            });
          } else {
            // Single image
            images.push({
              id: 'main',
              uri: equipment.imageUrl,
              title: 'Main Image'
            });
          }
        } catch (error) {
          // If JSON parsing fails, treat as single URL
          images.push({
            id: 'main',
            uri: equipment.imageUrl,
            title: 'Main Image'
          });
        }
      }

      // If no images found, add a fallback
      if (images.length === 0) {
        // Add a generic fallback image based on category
        const fallbackImage = equipment.category?.toLowerCase().includes('kam')
          ? 'https://images.unsplash.com/photo-1606983340077-bdc4ea88ec1b?w=600&h=600&fit=crop'
          : equipment.category?.toLowerCase().includes('račun')
          ? 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop'
          : 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop';

        images.push({
          id: 'fallback',
          uri: fallbackImage,
          title: equipment.name
        });
      }

      setEquipmentImages(images);
    };

    processImages();
  }, [equipment]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBookEquipment = () => {
    setShowCalendar(true);
  };


  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />
      
      <View className="flex-row items-center justify-between px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={handleBackPress} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          Detalji opreme
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="mx-4 mt-4">
          {equipmentImages.length > 0 ? (
            <View>
              <FlatList
                data={equipmentImages}
                renderItem={({ item, index }) => (
                  <View
                    className="rounded-xl overflow-hidden"
                    style={{
                      width: screenWidth - 32,
                      aspectRatio: 1,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  </View>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={({ nativeEvent }) => {
                  const index = Math.round(nativeEvent.contentOffset.x / (screenWidth - 32));
                  setCurrentImageIndex(index);
                }}
                scrollEventThrottle={16}
              />

              {/* Image indicators */}
              {equipmentImages.length > 1 && (
                <View className="flex-row justify-center mt-3">
                  {equipmentImages.map((_, index) => (
                    <View
                      key={index}
                      className="w-2 h-2 rounded-full mx-1"
                      style={{
                        backgroundColor: index === currentImageIndex ? colors.primary : colors.textSecondary + '30'
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View
              className="rounded-xl items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                aspectRatio: 1,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Ionicons
                name={
                  equipment.category === 'Kamere' ? 'camera' :
                  equipment.category === 'Stativni' ? 'camera-outline' :
                  equipment.category === 'Tableti' ? 'tablet-portrait' :
                  equipment.category === 'Studijski' ? 'business' :
                  equipment.category === 'Računala' ? 'laptop' :
                  'hardware-chip'
                }
                size={80}
                color={colors.textSecondary}
              />
            </View>
          )}
        </View>

        <View className="p-4">
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            {equipment.name}
          </Text>

          <Text className="text-base mb-4" style={{ color: colors.textSecondary }}>
            {equipment.category}
          </Text>

          <View className="flex-row items-center mb-6">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: equipment.available ? colors.success : colors.warning }}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: equipment.available ? colors.success : colors.warning }}
            >
              {equipment.available ? 'Dostupno' : 'Rezervirano'}
            </Text>
          </View>

          {!equipment.available && equipment.borrower && (
            <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                Trenutno posuđeno
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium mb-1" style={{ color: colors.text }}>
                    {equipment.borrower.name}
                  </Text>
                  <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                    {equipment.borrower.role === 'student' ? 'Student' : 'Nastavnik'} • {equipment.borrower.email}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.warning }}>
                    Povrat do: {new Date(equipment.borrower.borrowedUntil).toLocaleDateString('hr-HR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View className="ml-4">
                  <Ionicons
                    name={equipment.borrower.role === 'student' ? 'school' : 'person'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              </View>
            </View>
          )}

          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
              Opis
            </Text>
            <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
              {equipment.description}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
              Lokacija
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text className="text-base ml-2" style={{ color: colors.textSecondary }}>
                {equipment.location}
              </Text>
            </View>
          </View>

          {equipment.owner && (
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.surface }}>
                  <Ionicons
                    name={equipment.owner.role === 'student' ? 'school' : 'person'}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                    {equipment.owner.name}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {equipment.owner.role === 'student' ? 'Student' : 'Nastavnik'}
                  </Text>
                </View>
              </View>
            </View>
          )}


          {/* Student Feedback */}
          {equipment.available && (
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                Napomene za rezervaciju
              </Text>
              <TextInput
                placeholder="Dodajte napomenu za ovu rezervaciju (npr. za koji projekt, posebni zahtjevi...)"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                className="p-4 rounded-lg text-base"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  minHeight: 80,
                  textAlignVertical: 'top'
                }}
                maxLength={300}
              />
              <Text className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                Opcionalno - pomaže vlasniku/osoblju razumjeti vašu potrebu
              </Text>
            </View>
          )}

          {/* Related Equipment Suggestions */}
          {equipment.available && (
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                Možda vam također treba
              </Text>
              <Text className="text-sm mb-3" style={{ color: colors.textSecondary }}>
                Oprema koja se često koristi s ovim proizvodom:
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {getRelatedEquipment(equipment.category).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => navigation.push('EquipmentDetail', { equipment: item })}
                    className="mr-3 p-3 rounded-xl"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      width: 140
                    }}
                  >
                    <View className="items-center mb-2">
                      <View
                        className="w-10 h-10 rounded-lg items-center justify-center mb-2"
                        style={{ backgroundColor: item.available ? '#22c55e' : '#ef4444' }}
                      >
                        <Ionicons
                          name={getCategoryIcon(item.category)}
                          size={16}
                          color="white"
                        />
                      </View>
                    </View>
                    <Text
                      className="text-sm font-medium text-center mb-1"
                      style={{ color: colors.text }}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="text-xs text-center"
                      style={{ color: item.available ? colors.success : colors.warning }}
                    >
                      {item.available ? 'Dostupno' : 'Posuđeno'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {(selectedDates.start || selectedDates.end) && (
            <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>
                Odabrani datumi:
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Od: {selectedDates.start || 'Nije odabrano'}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Do: {selectedDates.end || 'Nije odabrano'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {equipment.available && (
        <View className="p-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
          {equipment.owner ? (
            // Non-owner actions for owned equipment - Contact options
            <View>
              <View className="flex-row mb-4">
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Poziv', 'Funkcija poziva bit će dodana uskoro.');
                  }}
                  className="flex-1 mr-2 py-3 rounded-xl items-center"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                >
                  <Ionicons name="call" size={20} color={colors.text} />
                  <Text className="text-sm mt-1" style={{ color: colors.text }}>
                    Poziv
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('E-pošta', `Kontakt: ${equipment.owner.email}`);
                  }}
                  className="flex-1 mx-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                >
                  <Ionicons name="mail" size={20} color={colors.text} />
                  <Text className="text-sm mt-1" style={{ color: colors.text }}>
                    E-pošta
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // University equipment - Book directly
            <TouchableOpacity
              onPress={userBooking ? null : handleBookEquipment}
              className="py-4 rounded-xl"
              style={{
                backgroundColor: userBooking ? colors.surface : colors.primary,
                borderWidth: userBooking ? 1 : 0,
                borderColor: userBooking ? colors.border : 'transparent'
              }}
              disabled={!!userBooking}
            >
              <Text
                className="text-center text-lg font-bold"
                style={{
                  color: userBooking ? colors.textSecondary : 'white'
                }}
              >
                {userBooking
                  ? `Moja rezervacija (${userBooking.status === 'PENDING' ? 'Čeka odobrenje' :
                                         userBooking.status === 'APPROVED' ? 'Odobreno' : 'Aktivno'})`
                  : 'Rezerviraj opremu'
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <DateRangePicker
            colors={colors}
            onDateSelect={setSelectedDates}
            selectedDates={selectedDates}
            onClose={() => setShowCalendar(false)}
            equipment={equipment}
            onBookingCreated={triggerRefresh}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EquipmentDetailScreen;