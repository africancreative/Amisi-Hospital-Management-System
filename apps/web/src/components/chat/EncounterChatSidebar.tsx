'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Paperclip, Send, Loader2, FileText, Image as ImageIcon } from 'lucide-react';

interface EncounterChat {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    messageType: string;
    referenceType?: string | null;
    referenceId?: string | null;
    attachmentUrl?: string | null;
    createdAt: string;
}

interface Props {
    encounterId: string;
}

export function EncounterChatSidebar({ encounterId }: Props) {
    const { token, user } = useAuth();
    const [messages, setMessages] = useState<EncounterChat[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat/encounter/messages?encounterId=${encounterId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && encounterId) {
            fetchMessages();
            // Polling for simplicity in this example (real-time can be added later)
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [token, encounterId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setSending(true);
        try {
            const res = await fetch('/api/chat/encounter/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    encounterId,
                    senderId: user.id,
                    senderName: user.name,
                    senderRole: user.role,
                    content: newMessage,
                    messageType: 'TEXT'
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center w-full bg-transparent">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col w-full bg-transparent text-white">
            {/* Header */}
            <div className="border-b border-gray-800 px-6 py-4 bg-gray-900/40">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Active Thread</h3>
                <p className="text-[10px] text-gray-500 font-bold mt-1">Clinical Context</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center text-[10px] uppercase tracking-widest font-bold text-gray-600 mt-10">
                        No messages in this thread yet.
                    </div>
                ) : (
                    messages.map((msg: any) => {
                        const isSystem = msg.messageType === 'SYSTEM';
                        const isMe = msg.senderId === user?.id;

                        if (isSystem) {
                            return (
                                <div key={msg.id} className="flex justify-center">
                                    <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-blue-400 uppercase flex items-center space-x-2">
                                        <span>{msg.content}</span>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1 ml-1 flex items-center space-x-2">
                                    <span className="text-gray-400">{msg.senderName}</span>
                                    <span>•</span>
                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div 
                                    className={`px-4 py-3 rounded-2xl max-w-[85%] text-xs font-medium shadow-xl ${
                                        isMe 
                                        ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20' 
                                        : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'
                                    }`}
                                >
                                    <p className="leading-relaxed">{msg.content}</p>
                                    
                                    {/* Attachment Preview (if any) */}
                                    {msg.attachmentUrl && (
                                        <div className="mt-2 p-2 rounded bg-white/20 dark:bg-black/20 flex items-center space-x-2 text-xs">
                                            {msg.messageType === 'IMAGE' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                            <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="underline hover:text-blue-200">
                                                View Attachment
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-800 p-4 bg-gray-900/40">
                <form onSubmit={handleSend} className="flex items-end space-x-3">
                    <button type="button" title="Attach file" className="p-3 text-gray-500 hover:text-white transition-colors rounded-xl bg-black/40 border border-white/5 hover:bg-white/10">
                        <Paperclip className="h-4 w-4" />
                    </button>
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus-within:border-blue-500/50 transition-all">
                        <textarea 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none focus:ring-0 resize-none text-[10px] font-bold text-white placeholder-gray-600 p-0 m-0"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        title="Send message"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
