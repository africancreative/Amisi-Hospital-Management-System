import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  Info, 
  LogOut,
  ChevronRight,
  Fingerprint
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <ScrollView className="flex-1 px-6">
        <Text className="text-white text-3xl font-bold mt-6 mb-8">Settings</Text>

        {/* Profile Section */}
        <View className="bg-[#161B2C] rounded-3xl p-6 mb-6 border border-gray-800 flex-row items-center">
           <View className="w-16 h-16 bg-[#2563EB]/20 rounded-full items-center justify-center border border-[#2563EB]/30 mr-4">
              <User size={32} color="#2563EB" />
           </View>
           <View className="flex-1">
              <Text className="text-white text-xl font-bold">Dr. Daniel Amisi</Text>
              <Text className="text-gray-500 font-medium">Senior Surgeon • Surgery</Text>
           </View>
           <TouchableOpacity className="bg-gray-800/50 p-2 rounded-full">
              <ChevronRight size={20} color="#6B7280" />
           </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <SettingsGroup title="Security & Access">
          <SettingsItem icon={Fingerprint} label="Biometric Login" value={true} isSwitch />
          <SettingsItem icon={Shield} label="Two-Factor Auth" value={false} isSwitch />
          <SettingsItem icon={Shield} label="Change PIN" />
        </SettingsGroup>

        <SettingsGroup title="System">
          <SettingsItem icon={Bell} label="Notifications" value={true} isSwitch />
          <SettingsItem icon={Database} label="Local Sync Mode" subLabel="Always use LAN when available" value={true} isSwitch />
          <SettingsItem icon={Database} label="Clear Local Cache" isDestructive />
        </SettingsGroup>

        <SettingsGroup title="About">
          <SettingsItem icon={Info} label="App Version" subLabel="v1.0.0 (Build 450)" />
          <SettingsItem icon={Info} label="Privacy Policy" />
        </SettingsGroup>

        {/* Logout */}
        <TouchableOpacity 
          onPress={() => router.replace('/login')}
          className="mt-4 mb-10 flex-row items-center justify-center space-x-2 bg-red-500/10 p-5 rounded-2xl border border-red-500/20"
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
        </TouchableOpacity>

        <View className="items-center mb-10">
           <Text className="text-gray-600 text-xs">AmisiMedOS Internal Platform</Text>
           <Text className="text-gray-700 text-[10px] mt-1">© 2026 Amisi Genuine Healthcare</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsGroup({ title, children }: any) {
  return (
    <View className="mb-8">
      <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 ml-1">{title}</Text>
      <View className="bg-[#161B2C] rounded-3xl border border-gray-800 overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function SettingsItem({ icon: Icon, label, subLabel, value, isSwitch, isDestructive }: any) {
  return (
    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-800/50">
      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDestructive ? 'bg-red-500/10' : 'bg-[#0A0F1E]'}`}>
        <Icon size={20} color={isDestructive ? '#EF4444' : '#2563EB'} />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-semibold ${isDestructive ? 'text-red-500' : 'text-white'}`}>{label}</Text>
        {subLabel && <Text className="text-gray-500 text-xs mt-0.5">{subLabel}</Text>}
      </View>
      {isSwitch ? (
        <Switch 
          value={value} 
          trackColor={{ false: '#0A0F1E', true: '#2563EB' }}
          thumbColor={value ? '#FFFFFF' : '#6B7280'}
        />
      ) : (
        <ChevronRight size={18} color="#374151" />
      )}
    </TouchableOpacity>
  );
}
