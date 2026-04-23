'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  Clock, 
  UserPlus,
  Flame,
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import { ClinicalWorkspace } from '@/components/clinical/ClinicalWorkspace';
import { api } from '@/trpc/react';

export default function EdModule() {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const { data: erData } = api.patient.list.useQuery({ limit: 10 });
    const erPatients = erData?.items;

    const handlePatientSelect = (p: any) => {
        setSelectedPatient({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            mrn: p.mrn,
            status: 'ER TRIAGE',
            visitId: 'er-visit-id',
            esiLevel: 2 
        });
    };

    const esiLevels = [
        { level: 1, label: 'RESUSCITATION', color: 'bg-red-600' },
        { level: 2, label: 'EMERGENT', color: 'bg-orange-500' },
        { level: 3, label: 'URGENT', color: 'bg-yellow-500' },
        { label: 'MSE', icon: Stethoscope, color: 'bg-blue-600' }
    ];

    return (
        <ClinicalWorkspace title="Emergency Department" department="ED" patient={selectedPatient || undefined}>
            <div className="space-y-8">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2 bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center animate-pulse"><Flame className="h-6 w-6 text-white" /></div>
                            <div><h3 className="text-xl font-black text-white uppercase tracking-tighter">Level 1 Trauma</h3></div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between"><div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-amber-500" /><h2 className="text-sm font-black text-white uppercase">Active ED Trackboard</h2></div></div>
                    <div className="divide-y divide-gray-800">
                        {erPatients?.map((p: any, idx: number) => (
                            <div key={p.id} onClick={() => handlePatientSelect(p)} className={`group flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer ${selectedPatient?.id === p.id ? 'bg-red-500/5 border-l-2 border-red-500' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl flex items-center justify-center text-xs font-black border bg-gray-950/80 border-gray-800 text-gray-400">{idx === 0 ? 'ESI 1' : `ESI ${idx + 2}`}</div>
                                    <div className="flex flex-col"><span className="text-sm font-bold text-white leading-none mb-1">{p.firstName} {p.lastName}</span></div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-700" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ClinicalWorkspace>
    );
}
