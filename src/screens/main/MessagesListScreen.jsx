import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';

const MessagesListScreen = ({ navigation }) => {
  const colors = useColors();

  // Mock conversations data
  const [conversations] = useState([
    {
      id: 1,
      ownerName: 'Prof. Marko Novak',
      ownerRole: 'profesor',
      ownerEmail: 'marko.novak@apu.hr',
      equipmentName: 'Nikon D3500',
      lastMessage: 'Oprema je dostupna od sutra. Možete doći u ured D-301 između 9:00 i 15:00...',
      timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      unread: true,
      equipment: {
        id: 1,
        name: 'Nikon D3500',
        category: 'Kamere',
        description: 'DSLR kamera za početnike, 24.2MP, AF-P DX NIKKOR objektiv',
        available: true,
        location: 'Studio A',
      }
    },
    {
      id: 2,
      ownerName: 'Prof. Ivo Kovač',
      ownerRole: 'profesor',
      ownerEmail: 'ivo.kovac@apu.hr',
      equipmentName: 'Wacom CTL-472',
      lastMessage: 'Hvala na poruci! Odgovori ću uskoro.',
      timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
      unread: false,
      equipment: {
        id: 3,
        name: 'Wacom CTL-472',
        category: 'Tableti',
        description: 'Grafički tablet za digitalno crtanje, USB povezivanje',
        available: false,
        location: 'Rezerviran',
      }
    },
    {
      id: 3,
      ownerName: 'Prof. Milan Horvat',
      ownerRole: 'profesor',
      ownerEmail: 'milan.horvat@apu.hr',
      equipmentName: 'Fotografski studio',
      lastMessage: 'Studio je rezerviran za vas sutra od 14:00 do 18:00.',
      timestamp: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
      unread: false,
      equipment: {
        id: 5,
        name: 'Fotografski studio',
        category: 'Studijski',
        description: 'Kompletni fotografski studio s rasvjetom i pozadinom',
        available: true,
        location: 'Studio C',
      }
    }
  ]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Sada';
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days === 1) return 'Jučer';
    if (days < 7) return `${days}d`;

    return timestamp.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const handleConversationPress = (conversation) => {
    const owner = {
      name: conversation.ownerName,
      role: conversation.ownerRole,
      email: conversation.ownerEmail,
    };

    navigation.navigate('Message', {
      owner: owner,
      equipment: conversation.equipment
    });
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleConversationPress(item)}
      className="flex-row items-center p-4"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      {/* Avatar */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: colors.surface }}
      >
        <Ionicons
          name={item.ownerRole === 'student' ? 'school' : 'person'}
          size={24}
          color={colors.primary}
        />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text }}
          >
            {item.ownerName}
          </Text>
          <Text
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        <Text
          className="text-sm mb-1"
          style={{ color: colors.textSecondary }}
        >
          {item.equipmentName}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm flex-1 ${item.unread ? 'font-medium' : ''}`}
            style={{ color: item.unread ? colors.text : colors.textSecondary }}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>

          {item.unread && (
            <View
              className="w-2 h-2 rounded-full ml-2"
              style={{ backgroundColor: colors.primary }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Poruke
        </Text>
      </View>

      {/* Conversations List */}
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="chatbubble-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text
            className="text-lg font-semibold mb-2 text-center"
            style={{ color: colors.text }}
          >
            Nema poruka
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: colors.textSecondary }}
          >
            Kada kontaktirate vlasnike opreme, razgovori će se prikazati ovdje.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MessagesListScreen;