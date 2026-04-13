'use client';

import { useState } from 'react';
import { api } from '@/trpc/client';
import { X, Send, FileText } from 'lucide-react';

export default function SoapNoteEditor({ patientId, onClose }: { patientId: string, onClose: () => void }) {
    const [s, setS] = useState('');
    const [o, setO] = useState('');
    const [a, setA] = useState('');
    const [p, setP] = useState('');

    const utils = api.useUtils();

    const { mutate: createSoap, isPending } = api.communication.createSoapNote.useMutation({
        onSuccess: () => {
            utils.communication.getTimeline.invalidate({ patientId });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!s && !o && !a && !p) return;
        
        createSoap({
            patientId,
            subjective: s,
            objective: o,
            assessment: a,
            plan: p

        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden isolate">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-indigo-500" />
                        </div>
                        <h2 className="text-xl font-bold dark:text-white">Record SOAP Note</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subjective</label>
                        <textarea
                            value={s}
                            onChange={(e) => setS(e.target.value)}
                            placeholder="Patient's chief complaint, history of present illness..."
                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none min-h-[80px]"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Objective</label>
                        <textarea
                            value={o}
                            onChange={(e) => setO(e.target.value)}
                            placeholder="Vital signs, physical exam findings, lab results..."
                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none min-h-[80px]"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Assessment</label>
                        <textarea
                            value={a}
                            onChange={(e) => setA(e.target.value)}
                            placeholder="Medical diagnosis, differential diagnosis..."
                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none min-h-[80px]"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Plan</label>
                        <textarea
                            value={p}
                            onChange={(e) => setP(e.target.value)}
                            placeholder="Treatment plan, prescriptions, follow-up instructions..."
                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none min-h-[80px]"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || (!s && !o && !a && !p)}
                            className="px-5 py-2.5 bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isPending ? 'Saving...' : 'Sign & Complete Note'}
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
