import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { 
  Users, 
  ClipboardList, 
  MessageSquare, 
  Activity, 
  Search, 
  Bell, 
  Calendar,
  ChevronRight,
  TrendingUp
} from 'lucide-react-native';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mt-6 mb-8">
          <View>
            <Text className="text-gray-400 text-sm font-medium">Monday, May 11</Text>
            <Text className="text-white text-2xl font-bold">Hello, Dr. Amisi</Text>
          </View>
          <View className="flex-row space-x-3">
             <TouchableOpacity className="w-10 h-10 bg-[#161B2C] rounded-full items-center justify-center border border-gray-800">
               <Search size={20} color="#9CA3AF" />
             </TouchableOpacity>
             <TouchableOpacity className="w-10 h-10 bg-[#161B2C] rounded-full items-center justify-center border border-gray-800">
               <Bell size={20} color="#9CA3AF" />
               <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0F1E]" />
             </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row space-x-4 mb-8">
          <View className="flex-1 bg-[#2563EB] rounded-3xl p-5 shadow-lg shadow-blue-500/20">
            <Activity size={24} color="white" />
            <Text className="text-white/80 text-sm mt-3 font-medium">Active Queue</Text>
            <Text className="text-white text-3xl font-bold mt-1">12</Text>
            <View className="flex-row items-center mt-2">
               <TrendingUp size={12} color="white" />
               <Text className="text-white/60 text-xs ml-1">+2 from 1h ago</Text>
            </View>
          </View>
          <View className="flex-1 bg-[#161B2C] rounded-3xl p-5 border border-gray-800">
            <Calendar size={24} color="#2563EB" />
            <Text className="text-gray-400 text-sm mt-3 font-medium">Appointments</Text>
            <Text className="text-white text-3xl font-bold mt-1">08</Text>
            <Text className="text-gray-600 text-xs mt-2 font-medium">Next: 14:30 PM</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-white text-lg font-bold mb-4">Clinical Workspace</Text>
        <View className="flex-row flex-wrap -mx-2 mb-8">
          <QuickActionIcon icon={Users} label="Patients" color="#3B82F6" />
          <QuickActionIcon icon={ClipboardList} label="EMR" color="#10B981" />
          <QuickActionIcon icon={MessageSquare} label="Consults" color="#8B5CF6" />
          <QuickActionIcon icon={Calendar} label="Schedule" color="#F59E0B" />
        </View>

        {/* Recent Activity */}
        <View className="flex-row justify-between items-center mb-4">
           <Text className="text-white text-lg font-bold">Recent Patients</Text>
           <TouchableOpacity><Text className="text-[#2563EB] font-bold">See All</Text></TouchableOpacity>
        </View>
        
        <PatientCard name="John Doe" id="PT-4501" status="Triaged" time="10m ago" />
        <PatientCard name="Sarah Wilson" id="PT-4502" status="In Treatment" time="25m ago" />
        <PatientCard name="Robert Smith" id="PT-4498" status="Waiting" time="45m ago" />

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActionIcon({ icon: Icon, label, color }: any) {
  return (
    <View className="w-1/4 px-2 mb-4">
      <TouchableOpacity className="items-center">
        <View className="w-14 h-14 rounded-2xl bg-[#161B2C] items-center justify-center border border-gray-800 mb-2">
          <Icon size={24} color={color} />
        </View>
        <Text className="text-gray-400 text-xs font-medium text-center">{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

function PatientCard({ name, id, status, time }: any) {
  return (
    <TouchableOpacity className="bg-[#161B2C] rounded-2xl p-4 mb-3 flex-row items-center border border-gray-800">
       <View className="w-12 h-12 bg-gray-800 rounded-xl items-center justify-center mr-4">
          <Text className="text-gray-400 font-bold">{name[0]}</Text>
       </View>
       <View className="flex-1">
          <Text className="text-white font-bold text-base">{name}</Text>
          <Text className="text-gray-500 text-xs">{id}</Text>
       </View>
       <View className="items-end">
          <View className="bg-[#10B981]/10 px-2 py-1 rounded-md mb-1 border border-[#10B981]/20">
             <Text className="text-[#10B981] text-[10px] font-bold uppercase">{status}</Text>
          </View>
          <Text className="text-gray-600 text-[10px]">{time}</Text>
       </View>
    </TouchableOpacity>
  );
}
