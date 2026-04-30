'use client';

import React from 'react';
import { useOnDuty } from '@/context/OnDutyContext';
import { Power, LogOut } from 'lucide-react';

export default function OnDutyWrapper({ 
    sidebar, 
    children 
}: { 
    sidebar: React.ReactNode, 
    children: React.ReactNode 
}) {
    const { isOnDuty, toggleOnDuty } = useOnDuty();

    if (isOnDuty) {
        return (
            <div className="flex h-screen w-full bg-[#07070a] overflow-hidden relative">
                {/* Operational UI only - Sidebar is HIDDEN */}
                <main className="flex-1 overflow-hidden relative">
                    {children}
                </main>

                {/* Secret/Minimal Off-Duty Toggle - Floating */}
                <button 
                    onClick={() => toggleOnDuty()}
                    className="fixed bottom-8 right-8 h-14 w-14 bg-rose-600 rounded-full shadow-2xl shadow-rose-900/40 flex items-center justify-center hover:bg-rose-500 transition-all z-[100] group"
                    title="Exit On-Duty Mode"
                >
                    <Power className="h-6 w-6 text-white group-hover:rotate-90 transition-all" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0a0a0b] text-white selection:bg-blue-500/30">
            {sidebar}
            <main className="flex-1 overflow-y-auto relative">
                {children}
                
                {/* On-Duty Trigger in normal UI */}
                <div className="fixed bottom-8 right-8">
                    <button 
                        onClick={() => toggleOnDuty('doctor')} // Default to doctor for now or show a selector
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/40 flex items-center gap-3 transition-all"
                    >
                        <Power className="h-4 w-4" />
                        Go On-Duty
                    </button>
                </div>
            </main>
        </div>
    );
}
