'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Clock, ChevronDown, ChevronUp, Paperclip, Mic, X, FileText, Music, Play, Pause } from 'lucide-react';
import { sendClinicalMessage, getClinicalMessages, ChatMessage, sendClinicalMedia } from '@/app/actions/ui-actions';
import { format } from 'date-fns';

export default function ClinicalChat({ patientId, authorName, authorRole }: { patientId: string, authorName: string, authorRole: string }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function loadMessages() {
        try {
            const data = await getClinicalMessages(patientId);
            setMessages(data as any);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if ((!newMessage.trim() && selectedFiles.length === 0 && !audioBlob) || isLoading) return;

        setIsLoading(true);
        try {
            if (selectedFiles.length > 0 || audioBlob) {
                const formData = new FormData();
                formData.append('content', newMessage);
                selectedFiles.forEach(file => formData.append('files', file));
                if (audioBlob) {
                    formData.append('files', new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' }));
                }
                await sendClinicalMedia(patientId, authorName, authorRole, formData);
            } else {
                await sendClinicalMessage(patientId, newMessage, authorName, authorRole);
            }

            setNewMessage('');
            setSelectedFiles([]);
            setAudioBlob(null);
            loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_: any, i: any) => i !== index));
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'w-96' : 'w-auto'}`}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors"
                >
                    <MessageSquare className="h-6 w-6" />
                </button>
            ) : (
                <div className="flex flex-col h-[600px] rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-semibold text-white">Clinical Chat</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 opacity-50">
                                <MessageSquare className="h-10 w-10" />
                                <p className="text-sm">No messages yet. Start the conversation.</p>
                            </div>
                        ) : (
                            messages.map((msg: any) => (
                                <div key={msg.id} className="flex flex-col space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-emerald-400">{msg.authorName}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">{msg.authorRole}</span>
                                    </div>
                                    <div className="bg-gray-800 rounded-2xl rounded-tl-none p-3 border border-gray-700/50">
                                        {msg.content && <p className="text-sm text-gray-200 leading-relaxed mb-2">{msg.content}</p>}

                                        {/* Attachments */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="grid grid-cols-1 gap-2 mt-2">
                                                {msg.attachments.map((att: any) => (
                                                    <div key={att.id} className="rounded-lg overflow-hidden border border-gray-700">
                                                        {att.type === 'image' ? (
                                                            <img src={att.url} alt="Clinical attachment" className="w-full object-cover max-h-48" />
                                                        ) : att.type === 'voice' ? (
                                                            <div className="flex items-center gap-3 p-2 bg-gray-900">
                                                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                    <Music className="h-4 w-4 text-emerald-500" />
                                                                </div>
                                                                <div className="flex-1 h-1 bg-gray-800 rounded-full relative">
                                                                    <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-500 rounded-full" />
                                                                </div>
                                                                <span className="text-[10px] text-gray-500">Voice Note</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-3 p-2 bg-gray-900">
                                                                <FileText className="h-5 w-5 text-gray-400" />
                                                                <span className="text-xs text-gray-300 truncate">{att.fileName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-end mt-1 items-center gap-1 opacity-40">
                                            <Clock className="h-3 w-3" />
                                            <span className="text-[10px]">{format(new Date(msg.timestamp), 'HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Previews */}
                    {(selectedFiles.length > 0 || audioBlob) && (
                        <div className="p-2 px-4 bg-gray-900 border-t border-gray-800 flex flex-wrap gap-2">
                            {selectedFiles.map((file: any, i: any) => (
                                <div key={i} className="relative h-12 w-12 rounded bg-gray-800 border border-gray-700 group">
                                    {file.type.startsWith('image/') ? (
                                        <img src={URL.createObjectURL(file)} className="h-full w-full object-cover rounded" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-gray-500" />
                                        </div>
                                    )}
                                    <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-0.5 text-white shadow-lg">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            {audioBlob && (
                                <div className="relative flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 group">
                                    <Music className="h-3 w-3 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-400">Voice Note Recorded</span>
                                    <button onClick={() => setAudioBlob(null)} className="text-gray-500 hover:text-white transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Input Footer */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-gray-950 border-t border-gray-800 flex items-center gap-2">
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-500 hover:text-emerald-400 transition-colors"
                        >
                            <Paperclip className="h-5 w-5" />
                        </button>

                        <div className="flex-1 relative flex items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={isRecording ? "Recording..." : "Type clinical note..."}
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600 pr-10"
                                disabled={isRecording}
                            />
                            <button
                                type="button"
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onMouseLeave={isRecording ? stopRecording : undefined}
                                className={`absolute right-2 p-1.5 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-emerald-500'}`}
                            >
                                <Mic className="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || (!newMessage.trim() && selectedFiles.length === 0 && !audioBlob)}
                            className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
