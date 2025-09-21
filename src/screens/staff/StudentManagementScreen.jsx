import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { apiService } from '../../services/ApiService';
import StudentCard from '../../components/cards/StudentCard';
import SearchBar from '../../components/common/SearchBar';
import Header from '../../components/common/Header';


const StudentManagementScreen = ({ navigation }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading students...');

      const response = await apiService.getUsers({ role: 'STUDENT' });
      const studentData = response.data || [];

      // Transform backend data to display format
      const transformedStudents = studentData.map(student => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        borrowedCount: 0, // TODO: Calculate from bookings
        lastActivity: 'N/A' // TODO: Calculate from activity
      }));

      setStudents(transformedStudents);
      console.log('👥 Students loaded:', transformedStudents.length);
    } catch (error) {
      console.error('❌ Failed to load students:', error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStudentPress = (student) => {
    // Show student details with actions (message, call, email)
    Alert.alert(
      student.name,
      `Email: ${student.email}\nAktivne posudbe: ${student.borrowedCount}`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Pošalji email',
          onPress: () => Alert.alert('Email', `Kontakt: ${student.email}`)
        },
        {
          text: 'Pozovi',
          onPress: () => Alert.alert('Poziv', 'Funkcija poziva bit će dodana uskoro.')
        }
      ]
    );
  };

  const renderStudentItem = ({ item }) => (
    <StudentCard student={item} onPress={handleStudentPress} />
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      <Header
        title="Upravljanje studentima"
        subtitle={`${students.length} registriranih studenata`}
      />

      {/* Search */}
      <View className="px-6 py-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pretražite studente..."
        />
      </View>

      {/* Students List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
            Učitavam studente...
          </Text>
        </View>
      ) : filteredStudents.length > 0 ? (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 24, paddingTop: 0 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="people-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text
            className="text-lg font-semibold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Nema studenata
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: colors.textSecondary }}
          >
            {searchQuery ? 'Pokušajte s drugim pojmovima za pretraživanje.' : 'Studenti će se prikazati ovdje kada se registriraju.'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default StudentManagementScreen;