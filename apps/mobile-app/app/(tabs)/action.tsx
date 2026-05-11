import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { X, UserPlus, ClipboardCheck, Syringe, Pill, TestTube, Thermometer } from 'lucide-react-native';

export default function ActionHub() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <View className="flex-1 p-8">
        <View className="flex-row justify-between items-center mb-12">
          <Text className="text-white text-3xl font-black">Quick Action</Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-[#161B2C] rounded-full items-center justify-center border border-gray-800"
          >
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap -mx-3">
          <HubButton icon={UserPlus} label="New Registration" color="#3B82F6" />
          <HubButton icon={ClipboardCheck} label="Vitals Intake" color="#10B981" />
          <HubButton icon={Syringe} label="Immunization" color="#8B5CF6" />
          <HubButton icon={Pill} label="Prescription" color="#EF4444" />
          <HubButton icon={TestTube} label="Lab Request" color="#F59E0B" />
          <HubButton icon={Thermometer} label="Triaging" color="#06B6D4" />
        </View>

        <View className="mt-auto mb-10 bg-[#161B2C] p-6 rounded-3xl border border-gray-800">
           <Text className="text-white font-bold text-lg mb-2">Scan for Action</Text>
           <Text className="text-gray-500 mb-6">Scan a patient barcode or ward tag to quickly open their records.</Text>
           <TouchableOpacity className="bg-[#2563EB] p-4 rounded-2xl items-center">
              <Text className="text-white font-bold">Launch Scanner</Text>
           </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function HubButton({ icon: Icon, label, color }: any) {
  return (
    <View className="w-1/2 p-3">
       <TouchableOpacity className="bg-[#161B2C] p-6 rounded-[32px] border border-gray-800 items-center justify-center">
          <View className="w-16 h-16 rounded-3xl items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
             <Icon size={32} color={color} />
          </View>
          <Text className="text-white font-bold text-center">{label}</Text>
       </TouchableOpacity>
    </View>
  );
}
