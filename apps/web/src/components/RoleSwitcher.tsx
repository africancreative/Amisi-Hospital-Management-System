'use client';

import { useState, useEffect } from 'react';
import { UserCircle, Shield, ChevronRight } from 'lucide-react';

const ROLES = [
    { id: 'ADMIN', name: 'Super Admin', color: 'bg-red-500' },
    { id: 'DOCTOR', name: 'Senior Clinician', color: 'bg-emerald-500' },
    { id: 'NURSE', name: 'Triage Nurse', color: 'bg-blue-500' },
    { id: 'ACCOUNTANT', name: 'Finance Manager', color: 'bg-amber-500' },
    { id: 'PHARMACIST', name: 'Head Pharmacist', color: 'bg-purple-500' },
    { id: 'HR', name: 'HR Director', color: 'bg-pink-500' },
] as const;

export default function RoleSwitcher() {
    const [currentRole, setCurrentRole] = useState('ADMIN');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('amisi-debug-role');
        if (saved) {
            setCurrentRole(saved);
        }
        // Small delay to prevent SSR hydarion issues
        setTimeout(() => setIsVisible(true), 500);
    }, []);

    const switchRole = (role: string) => {
        localStorage.setItem('amisi-debug-role', role);
        document.cookie = `amisi-user-role=${role}; path=/`;
        setCurrentRole(role);
        window.location.reload();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-72 z-50 flex items-center gap-2 group">
            <div className={`flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 shadow-2xl transition-all duration-300 group-hover:pr-6 cursor-pointer`}>
                <div className={`h-2.5 w-2.5 rounded-full ${ROLES.find(r => r.id === currentRole)?.color || 'bg-gray-500'} animate-pulse`} />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">
                    Debug: {ROLES.find(r => r.id === currentRole)?.name}
                </span>
                <Shield className="h-3.5 w-3.5 text-gray-500" />
            </div>

            <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 shadow-2xl w-56 flex flex-col gap-1">
                    <p className="px-3 py-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 mb-1">Switch System Role</p>
                    {ROLES.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => switchRole(role.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${currentRole === role.id
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${role.color}`} />
                                {role.name}
                            </div>
                            {currentRole === role.id && <ChevronRight className="h-3 w-3" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
