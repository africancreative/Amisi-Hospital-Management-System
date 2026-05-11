import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Search, MessageSquarePlus, CheckCheck } from 'lucide-react-native';

const MOCK_CHATS = [
  { id: '1', name: 'Emergency Dept', lastMessage: 'Ambulance arriving in 5 mins with trauma.', time: '2m', unread: 3, isGroup: true },
  { id: '2', name: 'Dr. Sarah Smith', lastMessage: 'Patient in Room 402 is stable now.', time: '15m', unread: 0, isGroup: false },
  { id: '3', name: 'Pharmacy - Lab', lastMessage: 'Blood test results for PT-4501 are ready.', time: '1h', unread: 0, isGroup: true },
  { id: '4', name: 'Night Shift Team', lastMessage: 'Handover complete. See you tomorrow.', time: '3h', unread: 0, isGroup: true },
  { id: '5', name: 'Dr. Robert', lastMessage: 'Can you check the MRI results?', time: '5h', unread: 0, isGroup: false },
];

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-3xl font-bold">Consults</Text>
          <TouchableOpacity className="bg-[#2563EB] w-12 h-12 rounded-2xl items-center justify-center">
            <MessageSquarePlus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="bg-[#161B2C] rounded-2xl p-4 flex-row items-center border border-gray-800 mb-6">
          <Search size={20} color="#6B7280" className="mr-3" />
          <Text className="text-gray-500 text-base">Search messages...</Text>
        </View>

        <FlatList
          data={MOCK_CHATS}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity className="flex-row items-center mb-6">
               <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 border ${item.isGroup ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                  <Text className={`text-lg font-bold ${item.isGroup ? 'text-indigo-400' : 'text-blue-400'}`}>
                    {item.name[0]}
                  </Text>
               </View>
               
               <View className="flex-1 border-b border-gray-800/50 pb-4">
                  <View className="flex-row justify-between items-center mb-1">
                     <Text className="text-white text-lg font-bold">{item.name}</Text>
                     <Text className="text-gray-600 text-xs">{item.time}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                     <Text className="text-gray-500 text-sm flex-1 mr-4" numberOfLines={1}>{item.lastMessage}</Text>
                     {item.unread > 0 ? (
                        <View className="bg-[#2563EB] px-2 py-0.5 rounded-full">
                           <Text className="text-white text-[10px] font-bold">{item.unread}</Text>
                        </View>
                     ) : (
                        <CheckCheck size={16} color="#4B5563" />
                     )}
                  </View>
               </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </SafeAreaView>
  );
}
