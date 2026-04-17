'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, ShieldCheck, HeartPulse } from 'lucide-react';
import { api } from '@/trpc/react';

interface ClinicalChatProps {
  patientId: string;
  visitId?: string;
}

/**
 * High-Fidelity Clinical Collaboration Hub
 * 
 * Provides real-time communication between nurses, doctors, and specialists
 * regarding a specific patient journey.
 */
export function ClinicalChat({ patientId }: ClinicalChatProps) {
  const [message, setMessage] = useState('');
  
  // 1. Fetch Chat History
  const { data: messages, refetch } = api.chat.getPatientMessages.useQuery({ 
    patientId 
  });

  // 2. Send Message Mutation
  const sendMessageMutation = api.chat.sendPatientMessage.useMutation({
    onSuccess: () => {
      setMessage('');
      refetch();
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({
      patientId,
      content: message,
      authorName: 'User',
      authorRole: 'USER'
    });
  };

  return (
    <div className="flex h-full flex-col bg-gray-950/50 border-l border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
        <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Collaboration Hub</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
            ENCRYPTED
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages?.map((msg: { id: string; authorRole: string; content: string; authorName: string }) => (
          <div key={msg.id} className={`flex flex-col ${msg.authorRole === 'SYSTEM' ? 'items-center' : ''}`}>
            {msg.authorRole === 'SYSTEM' ? (
              <div className="bg-gray-800/50 rounded-full px-4 py-1 border border-gray-700">
                <span className="text-[10px] font-medium text-gray-400 italic">{msg.content}</span>
              </div>
            ) : (
              <div className="flex gap-3 max-w-[90%]">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  msg.authorRole === 'DOCTOR' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                }`}>
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{msg.authorName}</span>
                    <span className="text-[9px] text-gray-500 uppercase font-black">{msg.authorRole}</span>
                  </div>
                  <div className="bg-gray-800/80 rounded-2xl rounded-tl-none px-4 py-2 border border-white/5 shadow-xl">
                    <p className="text-sm text-gray-200 leading-relaxed font-medium">{msg.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900/60 border-t border-gray-800">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-emerald-500 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Post a clinical update..."
              className="flex-1 bg-gray-950/80 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
            />
            <button
              onClick={handleSend}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
              disabled={sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
