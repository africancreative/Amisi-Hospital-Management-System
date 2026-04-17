'use client';

import { useState } from 'react';
import { MessageSquare, X, Users, MessageCircle, Send, Timer, Paperclip } from 'lucide-react';
import { api } from '@/trpc/client';
import { format } from 'date-fns';

export default function InternalChatSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [expiresInMs, setExpiresInMs] = useState<number | null>(null); // For ephemeral

    const { data: conversations } = api.internalChat.getConversations.useQuery(undefined, {
        enabled: isOpen,
        refetchInterval: 15000
    });

    const { data: messagesData, refetch: refetchMessages } = api.internalChat.getMessages.useQuery(
        { groupId: activeGroupId as string, limit: 50 },
        { 
            enabled: !!activeGroupId && isOpen,
            refetchInterval: 10000 
        }
    );

    const utils = api.useUtils();

    const sendMessage = api.internalChat.sendMessage.useMutation({
        onSuccess: () => {
            setNewMessage('');
            refetchMessages();
            utils.internalChat.getConversations.invalidate();
        }
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeGroupId) return;
        sendMessage.mutate({
            groupId: activeGroupId,
            content: newMessage,
            expiresInMinutes: expiresInMs ? Math.floor(expiresInMs / 60000) : undefined
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-105 z-50 group"
            >
                <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 group-hover:animate-ping" />
                <MessageSquare className="h-6 w-6" />
            </button>
        );
    }

    const activeGroup = conversations?.find((c: { id: string }) => c.id === activeGroupId);

    return (
        <div className="fixed top-0 right-0 bottom-0 w-[400px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right-full duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white leading-tight">Staff Comm</h2>
                        <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Secure & Encrypted
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {!activeGroupId ? (
                    /* Channels List */
                    <div className="w-full flex flex-col">
                        <div className="p-4 flex-1 overflow-y-auto space-y-2">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Groups</h3>
                            {conversations?.map((group: { id: string; type: string; name?: string }) => (
                                <button
                                    key={group.id}
                                    onClick={() => setActiveGroupId(group.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent dark:hover:border-gray-700 text-left"
                                >
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${group.type === 'DIRECT' ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                                        {group.type === 'DIRECT' ? <MessageCircle className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{group.name || 'Direct Message'}</h4>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{group.type === 'SYSTEM_BROADCAST' ? 'Hospital announcements' : 'Tap to view messages'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Chat View */
                    <div className="w-full flex flex-col">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-gray-950">
                            <button onClick={() => setActiveGroupId(null)} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                            <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{activeGroup?.name || 'Chat'}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
                            {messagesData?.messages.map((msg: { id: string; expiresAt?: Date; content: string }) => {
                                const isEphemeral = !!msg.expiresAt;
                                return (
                                    <div key={msg.id} className="flex flex-col gap-1 items-start">
                                        <div className="flex items-baseline gap-2 pl-1">
                                            <span className="text-xs font-bold text-blue-500">{(msg as any).sender?.firstName || 'Unknown'} {(msg as any).sender?.lastName || 'User'}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{format(new Date((msg as any).timestamp), 'HH:mm')}</span>
                                        </div>
                                        <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm text-sm break-words max-w-[90%] border border-gray-200 dark:border-gray-700 relative">
                                            {msg.content}
                                            {isEphemeral && (
                                                <div className="absolute -right-1 -bottom-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm" title="This message will self-destruct">
                                                    <Timer className="h-2.5 w-2.5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {!messagesData?.messages.length && (
                                <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">No messages sent yet.</div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setExpiresInMs(expiresInMs ? null : 60000)} // Toggle 1min ephemeral
                                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border flex items-center gap-1 transition-colors ${expiresInMs ? 'border-red-500 text-red-500 bg-red-50/10' : 'border-gray-300 dark:border-gray-700 text-gray-500'}`}
                                >
                                    <Timer className="h-3 w-3" />
                                    {expiresInMs ? 'Self-Destruct On (1m)' : 'Ephemeral Off'}
                                </button>
                            </div>
                            <div className="flex items-end gap-2">
                                <button type="button" className="p-2.5 text-gray-400 hover:text-blue-500 transition-colors">
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                                    placeholder="Type a clinical message..."
                                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[44px] max-h-32"
                                />
                                <button
                                    type="submit"
                                    disabled={sendMessage.isPending || !newMessage.trim()}
                                    className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
