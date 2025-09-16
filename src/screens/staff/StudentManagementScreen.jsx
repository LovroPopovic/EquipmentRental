import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import StudentCard from '../../components/cards/StudentCard';
import SearchBar from '../../components/common/SearchBar';
import Header from '../../components/common/Header';


const StudentManagementScreen = ({ navigation }) => {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock student data
  const [students] = useState([
    {
      id: 1,
      name: 'Ana Marić',
      email: 'ana.maric@student.apu.hr',
      borrowedCount: 2,
      lastActivity: '2 sata'
    },
    {
      id: 2,
      name: 'Petar Novak',
      email: 'petar.novak@student.apu.hr',
      borrowedCount: 1,
      lastActivity: '1 dan'
    },
    {
      id: 3,
      name: 'Marija Kovač',
      email: 'marija.kovac@student.apu.hr',
      borrowedCount: 0,
      lastActivity: '3 dana'
    },
    {
      id: 4,
      name: 'Luka Jurić',
      email: 'luka.juric@student.apu.hr',
      borrowedCount: 3,
      lastActivity: '4 sata'
    }
  ]);

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
          text: 'Chat',
          onPress: () => navigation.navigate('Chat', { otherUser: student })
        },
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
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 24, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default StudentManagementScreen;