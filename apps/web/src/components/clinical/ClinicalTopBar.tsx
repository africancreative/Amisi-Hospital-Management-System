'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Wifi, WifiOff, Activity, UserCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useOnDuty } from '@/context/OnDutyContext';

interface ClinicalTopBarProps {
    title: string;
    showTimer?: boolean;
    timerValue?: number;
    accentColor?: string;
    onPrimaryAction?: () => void;
    primaryActionLabel?: string;
    primaryActionIcon?: any;
}

export default function ClinicalTopBar({
    title,
    showTimer = true,
    timerValue = 0,
    accentColor = 'text-blue-500',
    onPrimaryAction,
    primaryActionLabel,
    primaryActionIcon: PrimaryIcon
}: ClinicalTopBarProps) {
    const { toggleOnDuty } = useOnDuty();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <header className="h-20 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl z-20">
            <div className="flex items-center gap-6">
                <Image src="/logo.png" alt="AmisiMedOS" width={40} height={40} className="object-contain" />
                <div className="h-8 w-[1px] bg-gray-800"></div>
                <div>
                    <h1 className={`text-sm font-black uppercase tracking-[0.2em] ${accentColor}`}>{title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        {isOnline ? (
                            <div className="flex items-center gap-1.5">
                                <Wifi className="h-3 w-3 text-emerald-500" />
                                <span className="text-[9px] font-black uppercase text-emerald-500/60">Cloud Sync Active</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 animate-pulse">
                                <WifiOff className="h-3 w-3 text-amber-500" />
                                <span className="text-[9px] font-black uppercase text-amber-500">Offline Mode</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8">
                {showTimer && (
                    <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border ${timerValue > 120 ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-gray-800 border-white/5 text-gray-400'}`}>
                        <Timer className="h-4 w-4" />
                        <span className="text-xl font-black font-mono tracking-tighter">{formatTime(timerValue)}</span>
                    </div>
                )}

                {onPrimaryAction && (
                    <button 
                        onClick={onPrimaryAction}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-3 ${accentColor.replace('text-', 'bg-')} text-white hover:opacity-90 active:scale-95`}
                    >
                        {primaryActionLabel}
                        {PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
                    </button>
                )}

                <div className="flex items-center gap-4 pl-8 border-l border-gray-800">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Authenticated</span>
                        <span className="text-xs font-black text-white leading-none">Clinical Staff</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center">
                        <UserCircle2 className="h-6 w-6 text-gray-500" />
                    </div>
                </div>
            </div>
        </header>
    );
}
