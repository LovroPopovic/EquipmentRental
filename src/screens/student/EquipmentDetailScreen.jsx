import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { Calendar } from 'react-native-calendars';

const DateRangePicker = ({ colors, onDateSelect, selectedDates, onClose, equipment }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [startDate, setStartDate] = useState(selectedDates.start || null);
  const [endDate, setEndDate] = useState(selectedDates.end || null);

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
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate(null);
      setMarkedDates({
        [selectedDate]: {
          startingDay: true,
          endingDay: true,
          color: colors.primary,
          textColor: 'white'
        }
      });
    } else if (startDate && !endDate) {
      let newStartDate = startDate;
      let newEndDate = selectedDate;
      
      if (new Date(selectedDate) < new Date(startDate)) {
        newStartDate = selectedDate;
        newEndDate = startDate;
      }
      
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setMarkedDates(createDateRange(newStartDate, newEndDate));
    }
  };

  const handleConfirm = () => {
    if (startDate && endDate) {
      onDateSelect({ start: startDate, end: endDate });
      
      Alert.alert(
        'Potvrda rezervacije',
        `Rezervirati ${equipment.name} od ${formatDateForDisplay(startDate)} do ${formatDateForDisplay(endDate)}?`,
        [
          { text: 'Odustani', style: 'cancel' },
          { 
            text: 'Rezerviraj', 
            onPress: () => {
              Alert.alert('Uspjeh', 'Oprema je uspješno rezervirana!');
              onClose();
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
              {formatDateForDisplay(endDate)}
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
  const { equipment } = route.params;
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [showCalendar, setShowCalendar] = useState(false);

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
        <View 
          className="mx-4 mt-4 rounded-xl items-center justify-center"
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

        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {equipment.name}
            </Text>
            <View className="flex-row items-center">
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
          </View>

          <Text className="text-base mb-4" style={{ color: colors.textSecondary }}>
            {equipment.category}
          </Text>

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

          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Brza rezervacija
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setSelectedDates({ start: today, end: tomorrow });
                }}
                className="flex-1 mr-2 p-3 rounded-lg"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-center font-medium" style={{ color: colors.text }}>
                  Danas - Sutra
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setSelectedDates({ start: today, end: nextWeek });
                }}
                className="flex-1 ml-2 p-3 rounded-lg"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-center font-medium" style={{ color: colors.text }}>
                  1 Tjedan
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
          <TouchableOpacity
            onPress={handleBookEquipment}
            className="py-4 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-center text-lg font-bold text-white">
              Rezerviraj opremu
            </Text>
          </TouchableOpacity>
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
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EquipmentDetailScreen;