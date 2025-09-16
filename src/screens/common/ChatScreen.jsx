import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { authService } from '../../services/AuthService';

const ChatScreen = ({ route, navigation }) => {
  const colors = useColors();
  const { otherUser, equipment, owner } = route.params;
  const [message, setMessage] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: `Pozdrav! Zanima me rezervacija opreme "${equipment?.name}". Kada biste bili slobodni?`,
      isOwn: false, // Other user message
      timestamp: new Date(Date.now() - 5 * 60000),
      sender: otherUser?.name || owner?.name
    },
    {
      id: '2',
      text: 'Pozdrav! Oprema je dostupna sutra od 10:00. Možete doći u ured D-301 za preuzimanje.',
      isOwn: true, // Current user message
      timestamp: new Date(Date.now() - 3 * 60000)
    },
    {
      id: '3',
      text: 'Savršeno! Hoću li trebati nešto posebno donijeti ili potpis?',
      isOwn: false,
      timestamp: new Date(Date.now() - 1 * 60000),
      sender: otherUser?.name || owner?.name
    }
  ]);
  const flatListRef = useRef();

  // Determine who we're chatting with
  const chatPartner = otherUser || owner;

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await authService.getUserRole();
        setCurrentUserRole(role);
      } catch (error) {
        console.error('Error getting user role:', error);
        setCurrentUserRole('student'); // fallback
      }
    };
    getUserRole();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSendMessage = () => {
    if (message.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      isOwn: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate other user response after 3 seconds
    setTimeout(() => {
      const responses = [
        'Hvala na informaciji!',
        'Razumijem, doći ću na vrijeme.',
        'Može, vidimo se sutra!',
        'Super, hvala vam puno!',
        'Odličo, do sutra!',
        'Može li to biti kasnije?',
        'Ima li neki problem?'
      ];

      const responseMessage = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isOwn: false,
        timestamp: new Date(),
        sender: chatPartner?.name
      };

      setMessages(prev => [...prev, responseMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 3000);
  };

  const handleCallUser = () => {
    Alert.alert(
      `Poziv ${chatPartner?.role === 'student' ? 'studenta' : 'nastavnika'}`,
      `Pozvati ${chatPartner?.name}?`,
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Pozovi',
          onPress: () => Alert.alert('Poziv', 'Funkcija poziva bit će dodana uskoro.')
        }
      ]
    );
  };

  const renderMessage = ({ item }) => {
    return (
      <View className={`mb-4 px-4 ${item.isOwn ? 'items-end' : 'items-start'}`}>
        {!item.isOwn && (
          <Text className="text-xs mb-1 ml-2" style={{ color: colors.textSecondary }}>
            {item.sender}
          </Text>
        )}
        <View
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
            item.isOwn ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
          style={{
            backgroundColor: item.isOwn ? colors.primary : colors.surface,
            borderWidth: item.isOwn ? 0 : 1,
            borderColor: colors.border
          }}
        >
          <Text
            className="text-base leading-5"
            style={{
              color: item.isOwn ? 'white' : colors.text,
            }}
          >
            {item.text}
          </Text>
        </View>
        <Text
          className={`text-xs mt-1 ${item.isOwn ? 'mr-2' : 'ml-2'}`}
          style={{ color: colors.textSecondary }}
        >
          {item.timestamp.toLocaleTimeString('hr-HR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  // Dynamic header title based on user role
  const getHeaderTitle = () => {
    if (currentUserRole === 'staff') {
      return chatPartner?.name || 'Student';
    } else {
      return chatPartner?.name || 'Nastavnik';
    }
  };

  const getHeaderSubtitle = () => {
    if (equipment?.name) {
      return `Rezervacija: ${equipment.name}`;
    }
    return chatPartner?.email || '';
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={handleBackPress} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View className="flex-1 ml-2">
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            {getHeaderTitle()}
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {getHeaderSubtitle()}
          </Text>
        </View>

        <TouchableOpacity onPress={handleCallUser} className="p-2">
          <Ionicons name="call" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          className="flex-1 pt-4"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input */}
        <View className="px-4 py-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
          <View className="flex-row items-end">
            <View
              className="flex-1 mr-3 px-4 py-3 rounded-2xl"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Napišite poruku..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
                className="text-base min-h-[20px] max-h-[100px]"
                style={{ color: colors.text }}
              />
            </View>
            <TouchableOpacity
              onPress={handleSendMessage}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: message.trim() ? colors.primary : colors.border
              }}
              disabled={!message.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={message.trim() ? 'white' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;