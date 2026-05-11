import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Lock, ArrowRight, Fingerprint } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0A0F1E]"
    >
      <View className="flex-1 p-8 justify-center">
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-[#2563EB]/10 rounded-3xl items-center justify-center border border-[#2563EB]/20 mb-6">
             <Image 
               source={require('../assets/images/icon.png')} 
               className="w-16 h-16" 
               resizeMode="contain"
             />
          </View>
          <Text className="text-white text-3xl font-black tracking-tight">AmisiMedOS</Text>
          <Text className="text-gray-400 text-base mt-1">Practitioner Access Terminal</Text>
        </View>

        <View className="space-y-4">
          <View className="bg-[#161B2C] rounded-2xl p-4 flex-row items-center border border-gray-800">
            <User size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-white"
              placeholder="Username or Email"
              placeholderTextColor="#4B5563"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View className="bg-[#161B2C] rounded-2xl p-4 flex-row items-center border border-gray-800">
            <Lock size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-white"
              placeholder="Password"
              placeholderTextColor="#4B5563"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')}
          className="mt-8 bg-[#2563EB] rounded-2xl p-5 flex-row items-center justify-center space-x-3 shadow-xl shadow-blue-500/20"
        >
          <Text className="text-white text-lg font-bold">Secure Sign In</Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity className="mt-6 items-center flex-row justify-center space-x-2">
          <Fingerprint size={24} color="#6B7280" />
          <Text className="text-gray-400 font-semibold">Enable Biometric Login</Text>
        </TouchableOpacity>

        <View className="absolute bottom-10 left-0 right-0 items-center">
           <TouchableOpacity onPress={() => router.push('/setup')}>
              <Text className="text-gray-500 text-sm">Switch Hospital Server</Text>
           </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
