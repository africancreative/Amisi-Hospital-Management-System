import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, MessageSquare, Settings, Plus } from 'lucide-react-native';
import { View, TouchableOpacity } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#0A0F1E',
          borderTopWidth: 1,
          borderTopColor: '#161B2C',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="action"
        options={{
          title: '',
          tabBarIcon: () => <ActionButton />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

function ActionButton() {
  return (
    <View className="absolute bottom-[-10px]">
      <TouchableOpacity 
        activeOpacity={0.8}
        className="w-16 h-16 bg-[#2563EB] rounded-2xl items-center justify-center shadow-xl shadow-blue-500/40 border-4 border-[#0A0F1E]"
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
