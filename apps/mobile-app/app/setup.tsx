import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Hospital, Globe, Database, ShieldCheck } from 'lucide-react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function SetupScreen() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [localIp, setLocalIp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    if (!slug) {
      Alert.alert('Error', 'Hospital Slug is required');
      return;
    }
    setIsLoading(true);
    try {
      // Simulate validation and persistence
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.replace('/login');
    } catch (error) {
      Alert.alert('Setup Failed', 'Could not connect to the hospital server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#0A0F1E] p-6">
      <View className="mt-12 mb-10">
        <Hospital size={48} color="#2563EB" />
        <Text className="text-white text-3xl font-bold mt-4">Welcome to AmisiMedOS</Text>
        <Text className="text-gray-400 text-lg mt-2">Initialize your clinical node connection.</Text>
      </View>

      <View className="space-y-6">
        <View>
          <Text className="text-gray-300 text-sm font-semibold mb-2">Hospital Slug</Text>
          <View className="flex-row items-center bg-[#161B2C] rounded-xl p-4 border border-gray-800">
            <Globe size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-white text-lg"
              placeholder="e.g. amisi-general"
              placeholderTextColor="#4B5563"
              value={slug}
              onChangeText={setSlug}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View>
          <Text className="text-gray-300 text-sm font-semibold mb-2">Local Node IP (Optional)</Text>
          <View className="flex-row items-center bg-[#161B2C] rounded-xl p-4 border border-gray-800">
            <Database size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-white text-lg"
              placeholder="192.168.1.100"
              placeholderTextColor="#4B5563"
              value={localIp}
              onChangeText={setLocalIp}
              keyboardType="numeric"
            />
          </View>
          <Text className="text-gray-500 text-xs mt-2">Enable high-speed local sync in LAN mode.</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSetup}
        disabled={isLoading}
        className={`mt-10 bg-[#2563EB] rounded-2xl p-5 items-center shadow-lg shadow-blue-500/20 ${isLoading ? 'opacity-50' : ''}`}
      >
        <Text className="text-white text-xl font-bold">
          {isLoading ? 'Connecting...' : 'Continue'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center justify-center mt-8 space-x-2">
        <ShieldCheck size={16} color="#10B981" />
        <Text className="text-gray-500 text-xs">HIPAA Compliant & End-to-End Encrypted</Text>
      </View>
    </ScrollView>
  );
}
