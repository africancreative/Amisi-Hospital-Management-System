'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Activity, 
    Thermometer, 
    Droplets, 
    Heart, 
    Wind,
    CheckCircle2,
    Save
} from 'lucide-react';

interface VitalsData {
    temp: string;
    pulse: string;
    resp: string;
    systolic: string;
    diastolic: string;
    spo2: string;
    complaint: string;
}

export default function NurseTriage({ patient, onSave }: { patient: any, onSave: (data: VitalsData) => void }) {
    const [vitals, setVitals] = useState<VitalsData>({
        temp: '',
        pulse: '',
        resp: '',
        systolic: '',
        diastolic: '',
        spo2: '',
        complaint: ''
    });

    const getRiskColor = (type: string, value: string) => {
        const val = parseFloat(value);
        if (isNaN(val)) return 'border-gray-800 text-gray-500';
        
        if (type === 'temp') {
            if (val > 38 || val < 35.5) return 'border-rose-500 text-rose-500 bg-rose-500/5';
            if (val > 37.5) return 'border-amber-500 text-amber-500 bg-amber-500/5';
        }
        if (type === 'spo2') {
            if (val < 92) return 'border-rose-500 text-rose-500 bg-rose-500/5';
            if (val < 95) return 'border-amber-500 text-amber-500 bg-amber-500/5';
        }
        if (type === 'pulse') {
            if (val > 110 || val < 50) return 'border-rose-500 text-rose-500 bg-rose-500/5';
        }
        
        return 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5';
    };

    const cards = [
        { id: 'temp', label: 'Temperature', unit: '°C', icon: Thermometer, placeholder: '36.5' },
        { id: 'pulse', label: 'Pulse Rate', unit: 'bpm', icon: Heart, placeholder: '72' },
        { id: 'resp', label: 'Resp Rate', unit: 'bpm', icon: Wind, placeholder: '16' },
        { id: 'systolic', label: 'Systolic BP', unit: 'mmHg', icon: Activity, placeholder: '120' },
        { id: 'diastolic', label: 'Diastolic BP', unit: 'mmHg', icon: Activity, placeholder: '80' },
        { id: 'spo2', label: 'SpO2', unit: '%', icon: Droplets, placeholder: '98' },
    ];

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Activity className="h-6 w-6 text-blue-500" />
                        Patient Triage
                    </h2>
                    <p className="text-gray-500 text-xs font-bold uppercase mt-1">Assessing: {patient.name} ({patient.mrn})</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
                        Stable Patient
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {cards.map((card) => (
                    <motion.div 
                        key={card.id}
                        whileHover={{ y: -4 }}
                        className={`p-6 rounded-[32px] border transition-all ${getRiskColor(card.id, (vitals as any)[card.id])}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{card.label}</span>
                            <card.icon className="h-4 w-4 opacity-40" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <input 
                                type="number"
                                value={(vitals as any)[card.id]}
                                onChange={(e) => setVitals({...vitals, [card.id]: e.target.value})}
                                className="bg-transparent text-4xl font-black w-full outline-none placeholder:opacity-20"
                                placeholder={card.placeholder}
                            />
                            <span className="text-sm font-bold opacity-40">{card.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chief Complaint / Observations</label>
                <textarea 
                    value={vitals.complaint}
                    onChange={(e) => setVitals({...vitals, complaint: e.target.value})}
                    rows={4}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-3xl p-6 text-white text-sm outline-none focus:border-blue-500/50 transition-all resize-none"
                    placeholder="Enter patient complaints or physical findings..."
                />
            </div>

            <div className="mt-auto pt-8 flex gap-4">
                <button 
                    onClick={() => setVitals({ temp: '', pulse: '', resp: '', systolic: '', diastolic: '', spo2: '', complaint: '' })}
                    className="flex-1 py-5 rounded-[24px] border border-gray-800 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                    Clear All
                </button>
                <button 
                    onClick={() => onSave(vitals)}
                    className="flex-[2] py-5 rounded-[24px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3"
                >
                    <Save className="h-4 w-4" />
                    Save & Finalize Triage
                </button>
            </div>
        </div>
    );
}
