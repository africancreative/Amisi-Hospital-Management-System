'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface OnDutyContextType {
    isOnDuty: boolean;
    toggleOnDuty: (role?: string) => void;
    currentRole: string | null;
}

const OnDutyContext = createContext<OnDutyContextType | undefined>(undefined);

export function OnDutyProvider({ children }: { children: React.ReactNode }) {
    const [isOnDuty, setIsOnDuty] = useState(false);
    const [currentRole, setCurrentRole] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const saved = localStorage.getItem('amisimedos_on_duty');
        if (saved) {
            const { status, role } = JSON.parse(saved);
            setIsOnDuty(status);
            setCurrentRole(role);
        }
    }, []);

    const toggleOnDuty = (role?: string) => {
        const newStatus = !isOnDuty;
        const targetRole = role || currentRole || 'triage';
        
        setIsOnDuty(newStatus);
        setCurrentRole(targetRole);
        
        localStorage.setItem('amisimedos_on_duty', JSON.stringify({ status: newStatus, role: targetRole }));

        if (newStatus) {
            // Lock into operational UI
            const slug = pathname.split('/')[1];
            router.push(`/${slug}/${targetRole}`);
        }
    };

    return (
        <OnDutyContext.Provider value={{ isOnDuty, toggleOnDuty, currentRole }}>
            {children}
        </OnDutyContext.Provider>
    );
}

export function useOnDuty() {
    const context = useContext(OnDutyContext);
    if (context === undefined) {
        throw new Error('useOnDuty must be used within an OnDutyProvider');
    }
    return context;
}
