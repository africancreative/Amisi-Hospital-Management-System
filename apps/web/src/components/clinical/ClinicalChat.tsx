'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    Users, 
    User, 
    Hash, 
    Search, 
    MoreVertical, 
    Paperclip, 
    Smile, 
    Stethoscope, 
    AlertCircle, 
    Bell,
    CheckCheck,
    MessageSquare,
    Phone,
    Video
} from 'lucide-react';
import Image from 'next/image';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    type: 'text' | 'alert' | 'system';
    isRead: boolean;
    patientId?: string; // Optional context
}

interface ChatChannel {
    id: string;
    name: string;
    type: 'direct' | 'department' | 'patient';
    unreadCount: number;
    lastMessage?: string;
    status?: 'online' | 'offline' | 'busy';
}

interface ClinicalChatProps {
    patientId?: string;
    visitId?: string;
}

export default function ClinicalChat({ patientId, visitId }: ClinicalChatProps) {
    const [channels, setChannels] = useState<ChatChannel[]>([
        { id: '1', name: '# Lab-Team', type: 'department', unreadCount: 3, lastMessage: 'Results for AM-4521 are uploaded.' },
        { id: '2', name: 'Dr. Sarah Wilson', type: 'direct', unreadCount: 0, lastMessage: 'Can you check the vitals for Bed 302?', status: 'online' },
        { id: '3', name: 'Nrs. Amina Ali', type: 'direct', unreadCount: 1, lastMessage: 'Medication administered.', status: 'online' },
        { id: '4', name: 'Patient: Robert J.', type: 'patient', unreadCount: 0, lastMessage: 'Pre-op prep complete.' },
        { id: '5', name: '# Pharmacy-Main', type: 'department', unreadCount: 0, lastMessage: 'Stock restocked: Amoxicillin.' },
    ]);

    const [activeChannel, setActiveChannel] = useState<ChatChannel>(channels[1]);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', senderId: 'user1', senderName: 'Dr. Sarah Wilson', content: 'Hi, I just reviewed the labs for Robert Johnson.', timestamp: '10:05 AM', type: 'text', isRead: true },
        { id: '2', senderId: 'me', senderName: 'Me', content: 'Yes, looking at them now. Any concerns?', timestamp: '10:06 AM', type: 'text', isRead: true },
        { id: '3', senderId: 'user1', senderName: 'Dr. Sarah Wilson', content: 'Potassium is slightly high (5.8). Please re-check vitals and notify if he feels weak.', timestamp: '10:08 AM', type: 'text', isRead: true, patientId: 'AM-4521' },
    ]);

    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            senderName: 'Me',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            isRead: false
        };
        setMessages([...messages, newMessage]);
        setInputValue('');
    };

    return (
        <div className="flex h-screen bg-[#07070a] text-white overflow-hidden">
            {/* LEFT SIDEBAR: CHANNELS */}
            <aside className="w-80 border-r border-gray-800 bg-gray-900/20 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black uppercase tracking-tight">Messages</h2>
                        <div className="relative">
                            <Bell className="h-5 w-5 text-gray-500" />
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-gray-900"></span>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find staff or channel..."
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {channels.map(channel => (
                        <button 
                            key={channel.id}
                            onClick={() => setActiveChannel(channel)}
                            className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all group ${
                                activeChannel.id === channel.id 
                                ? 'bg-blue-600/10 border border-blue-500/30' 
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <div className="relative">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black ${
                                    channel.type === 'department' ? 'bg-purple-600/20 text-purple-400' : 
                                    channel.type === 'patient' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-blue-600/20 text-blue-400'
                                }`}>
                                    {channel.type === 'department' ? <Hash className="h-5 w-5" /> : 
                                     channel.type === 'patient' ? <Stethoscope className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                {channel.status === 'online' && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-gray-900 rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-sm font-black truncate">{channel.name}</span>
                                    {channel.unreadCount > 0 && (
                                        <span className="bg-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded-full">{channel.unreadCount}</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 truncate font-bold uppercase">{channel.lastMessage}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* MAIN CHAT AREA */}
            <main className="flex-1 flex flex-col bg-gray-900/10 relative">
                {/* CHAT HEADER */}
                <header className="h-20 border-b border-gray-800 bg-gray-900/40 backdrop-blur-xl flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 font-black">
                            {activeChannel.name[0]}
                        </div>
                        <div>
                            <h3 className="text-base font-black">{activeChannel.name}</h3>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                Active Collaboration
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all"><Phone className="h-4 w-4" /></button>
                        <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all"><Video className="h-4 w-4" /></button>
                        <div className="h-8 w-[1px] bg-gray-800 mx-2"></div>
                        <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all"><MoreVertical className="h-4 w-4" /></button>
                    </div>
                </header>

                {/* MESSAGES LIST */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
                >
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div 
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-xl flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{msg.senderName}</span>
                                        <span className="text-[10px] text-gray-600 font-bold">{msg.timestamp}</span>
                                    </div>
                                    <div className={`p-6 rounded-[28px] text-sm font-bold leading-relaxed shadow-lg ${
                                        msg.senderId === 'me' 
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20' 
                                        : 'bg-gray-900/60 border border-white/5 text-gray-200 rounded-tl-none'
                                    }`}>
                                        {msg.patientId && (
                                            <div className="mb-3 flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/10 text-[9px] text-blue-400 font-black uppercase">
                                                <Stethoscope className="h-3 w-3" />
                                                Context: Patient {msg.patientId}
                                            </div>
                                        )}
                                        {msg.content}
                                    </div>
                                    {msg.senderId === 'me' && (
                                        <div className="mt-2 flex items-center gap-1">
                                            <CheckCheck className="h-3 w-3 text-blue-500" />
                                            <span className="text-[8px] font-black text-blue-500 uppercase">Seen</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* INPUT AREA */}
                <div className="p-8 border-t border-gray-800 bg-gray-900/20">
                    <div className="bg-black/40 border border-white/5 rounded-[32px] p-2 flex items-center gap-2 group focus-within:border-blue-500/50 transition-all">
                        <button className="h-12 w-12 rounded-[24px] flex items-center justify-center text-gray-500 hover:bg-white/5 transition-all"><Paperclip className="h-5 w-5" /></button>
                        <input 
                            type="text" 
                            placeholder="Type a clinical note or message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold px-4 h-12 placeholder:text-gray-700"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="h-12 w-12 rounded-[24px] flex items-center justify-center text-gray-500 hover:bg-white/5 transition-all"><Smile className="h-5 w-5" /></button>
                        <button 
                            onClick={handleSend}
                            className="h-12 px-8 bg-blue-600 rounded-[24px] flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all"
                        >
                            Send
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </main>

        </div>
    );
}
