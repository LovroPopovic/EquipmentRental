import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import Header from '../../components/common/Header';

const StaffMessagesListScreen = ({ navigation }) => {
  const colors = useColors();

  // Mock conversations data
  const [conversations] = useState([
    {
      id: '1',
      student: {
        name: 'Ana Marić',
        email: 'ana.maric@student.apu.hr',
        borrowedCount: 2
      },
      equipment: { name: 'Canon EOS R5' },
      lastMessage: 'Hvala na informaciji! Doći ću sutra u 10:00.',
      timestamp: new Date(Date.now() - 30 * 60000), // 30 min ago
      unreadCount: 0,
      isActive: true
    },
    {
      id: '2',
      student: {
        name: 'Petar Novak',
        email: 'petar.novak@student.apu.hr',
        borrowedCount: 1
      },
      equipment: { name: 'MacBook Pro 16"' },
      lastMessage: 'Možemo li produžiti posudbu za još 3 dana?',
      timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
      unreadCount: 2,
      isActive: true
    },
    {
      id: '3',
      student: {
        name: 'Marija Kovač',
        email: 'marija.kovac@student.apu.hr',
        borrowedCount: 0
      },
      equipment: { name: 'Sony A7 III' },
      lastMessage: 'Oprema je vraćena u perfektnom stanju. Hvala!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000), // 1 day ago
      unreadCount: 0,
      isActive: false
    },
    {
      id: '4',
      student: {
        name: 'Luka Jurić',
        email: 'luka.juric@student.apu.hr',
        borrowedCount: 1
      },
      equipment: { name: 'iPad Pro 12.9"' },
      lastMessage: 'Kada mogu doći preuzeti opremu?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000), // 3 days ago
      unreadCount: 1,
      isActive: true
    }
  ]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      return minutes < 1 ? 'Sada' : `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days < 7) {
      return `${days}d`;
    } else {
      return timestamp.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat', {
        otherUser: item.student,
        equipment: item.equipment
      })}
      className="px-4 py-4"
      style={{
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-bold text-lg">
            {item.student.name.charAt(0)}
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-semibold text-base" style={{ color: colors.text }}>
              {item.student.name}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {formatTimestamp(item.timestamp)}
              </Text>
              {item.unreadCount > 0 && (
                <View
                  className="w-5 h-5 rounded-full items-center justify-center ml-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white text-xs font-bold">
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text
            className="text-sm mb-1"
            style={{ color: colors.textSecondary }}
            numberOfLines={1}
          >
            {item.equipment.name}
          </Text>

          <Text
            className={`text-sm ${item.unreadCount > 0 ? 'font-medium' : ''}`}
            style={{
              color: item.unreadCount > 0 ? colors.text : colors.textSecondary
            }}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </View>

        {/* Status indicator */}
        <View className="ml-2">
          <View
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: item.isActive ? colors.success : colors.textSecondary
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar backgroundColor={colors.background} barStyle={colors.statusBarStyle} />

      {/* Header */}
      <Header
        title="Poruke"
        subtitle={`${conversations.filter(c => c.unreadCount > 0).length} nepročitanih`}
      />

      {/* Conversations List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default StaffMessagesListScreen;