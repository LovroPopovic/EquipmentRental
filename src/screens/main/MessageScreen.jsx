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

const MessageScreen = ({ route, navigation }) => {
  const colors = useColors();
  const { owner, equipment } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Pozdrav ${owner.name},\n\nZanima me rezervacija opreme "${equipment.name}" iz kategorije ${equipment.category}.\n\nMogu li saznati kada je oprema dostupna i kako možemo organizirati preuzimanje?\n\nHvala unaprijed!`,
      sender: 'me',
      timestamp: new Date(Date.now() - 10 * 60000),
    },
    {
      id: 2,
      text: 'Pozdrav!\n\nOprema je dostupna od sutra. Možete doći u ured D-301 između 9:00 i 15:00 za preuzimanje.\n\nTrebate li pomoć s postavkama?',
      sender: 'other',
      timestamp: new Date(Date.now() - 5 * 60000),
    }
  ]);
  const flatListRef = useRef();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSendMessage = () => {
    if (message.trim().length === 0) return;

    const newMessage = {
      id: messages.length + 1,
      text: message.trim(),
      sender: 'me',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate response (optional)
    setTimeout(() => {
      const responses = [
        'Hvala na poruci! Odgovori ću uskoro.',
        'Vidim poruku, javim se kroz par minuta.',
        'U redu, organizirat ćemo to.'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const responseMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'other',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, responseMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 2000);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Sada';
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    return timestamp.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';

    return (
      <View className={`mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
        <View
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${isMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
          style={{
            backgroundColor: isMe ? colors.primary : colors.surface,
          }}
        >
          <Text
            className="text-base leading-5"
            style={{
              color: isMe ? 'white' : colors.text
            }}
          >
            {item.text}
          </Text>
        </View>
        <Text
          className="text-xs mt-1 px-2"
          style={{ color: colors.textSecondary }}
        >
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    // Auto-scroll to bottom when component mounts
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={handleBackPress} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View className="flex-row items-center flex-1 ml-2">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons
              name={owner.role === 'student' ? 'school' : 'person'}
              size={20}
              color={colors.primary}
            />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              {owner.name}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {equipment.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Kontakt opcije',
              'Odaberite način kontakta',
              [
                {
                  text: 'Poziv',
                  onPress: () => Alert.alert('Poziv', 'Funkcija poziva bit će dodana uskoro.')
                },
                {
                  text: 'E-pošta',
                  onPress: () => Alert.alert('E-pošta', `Kontakt: ${owner.email}`)
                },
                { text: 'Odustani', style: 'cancel' }
              ]
            );
          }}
          className="p-2"
        >
          <Ionicons name="call" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input */}
        <View
          className="flex-row items-end p-4"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <View
            className="flex-1 flex-row items-end mr-3 px-4 py-2 rounded-2xl"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 44
            }}
          >
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Upišite poruku..."
              placeholderTextColor={colors.textSecondary}
              multiline
              className="flex-1 text-base py-2"
              style={{ color: colors.text }}
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={message.trim().length === 0}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{
              backgroundColor: message.trim().length > 0 ? colors.primary : colors.border,
              opacity: message.trim().length > 0 ? 1 : 0.5
            }}
          >
            <Ionicons
              name="send"
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessageScreen;