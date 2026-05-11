import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Search, UserPlus, Filter, ChevronRight } from 'lucide-react-native';

const MOCK_PATIENTS = [
  { id: '1', name: 'John Doe', mrn: 'AM-2024-001', gender: 'M', age: '45', lastVisit: '2 days ago' },
  { id: '2', name: 'Sarah Wilson', mrn: 'AM-2024-002', gender: 'F', age: '32', lastVisit: 'Today' },
  { id: '3', name: 'Robert Smith', mrn: 'AM-2024-003', gender: 'M', age: '67', lastVisit: '1 week ago' },
  { id: '4', name: 'Emily Brown', mrn: 'AM-2024-004', gender: 'F', age: '28', lastVisit: '3 days ago' },
  { id: '5', name: 'Michael Johnson', mrn: 'AM-2024-005', gender: 'M', age: '54', lastVisit: 'Yesterday' },
];

export default function PatientsScreen() {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-3xl font-bold">Patients</Text>
          <TouchableOpacity className="bg-[#2563EB] w-12 h-12 rounded-2xl items-center justify-center">
            <UserPlus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row space-x-3 mb-6">
          <View className="flex-1 bg-[#161B2C] rounded-2xl p-4 flex-row items-center border border-gray-800">
            <Search size={20} color="#6B7280" className="mr-3" />
            <TextInput
              className="flex-1 text-white text-base"
              placeholder="Search by MRN or Name"
              placeholderTextColor="#4B5563"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity className="bg-[#161B2C] w-14 h-14 rounded-2xl items-center justify-center border border-gray-800">
            <Filter size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-[#161B2C] rounded-3xl p-5 mb-4 border border-gray-800 flex-row items-center">
               <View className="w-14 h-14 bg-[#2563EB]/10 rounded-2xl items-center justify-center mr-4 border border-[#2563EB]/20">
                  <Text className="text-[#2563EB] text-xl font-bold">{item.name[0]}</Text>
               </View>
               <View className="flex-1">
                  <Text className="text-white text-lg font-bold">{item.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-gray-500 text-sm">{item.mrn}</Text>
                    <Text className="text-gray-700 mx-2">•</Text>
                    <Text className="text-gray-500 text-sm">{item.gender}, {item.age}y</Text>
                  </View>
                  <Text className="text-[#10B981] text-xs mt-2 font-semibold">Last visit: {item.lastVisit}</Text>
               </View>
               <ChevronRight size={20} color="#374151" />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
