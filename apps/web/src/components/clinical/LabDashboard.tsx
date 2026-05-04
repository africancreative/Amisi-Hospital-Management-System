'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Beaker, 
    FlaskConical, 
    Activity, 
    CheckCircle2, 
    Clock, 
    ChevronRight, 
    ArrowRightCircle,
    Upload,
    Save,
    AlertCircle,
    UserCircle2,
    Microscope,
    FileText
} from 'lucide-react';
import { LOINC_LAB_TESTS, LabParameter } from '@amisimedos/constants';
import Image from 'next/image';

interface LabTest {
    id: string;
    testCode: string; // 'FBC', 'MP', etc.
    testName: string;
    patientName: string;
    mrn: string;
    priority: 'NORMAL' | 'URGENT' | 'STAT';
    waitTime: string;
    orderedBy: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
}

export default function LabDashboard() {
    const [queue, setQueue] = useState<LabTest[]>([
        { 
            id: 'LAB-9901', testCode: 'FBC', testName: 'Full Blood Count (FBC)', 
            patientName: 'David G. Miller', mrn: 'AM-4521', 
            priority: 'STAT', waitTime: '12m', 
            orderedBy: 'Dr. Sarah Chen', status: 'PENDING' 
        },
        { 
            id: 'LAB-9902', testCode: 'MP', testName: 'Malaria Parasite (MP)', 
            patientName: 'Sarah Jenkins', mrn: 'AM-4522', 
            priority: 'URGENT', waitTime: '25m', 
            orderedBy: 'Dr. Isaac Liu', status: 'PENDING' 
        },
    ]);

    const [activeTest, setActiveTest] = useState<LabTest | null>(queue[0]);
    const [results, setResults] = useState<{ [key: string]: string }>({});

    // When activeTest changes, initialize results with the parameters for that test type
    React.useEffect(() => {
        if (activeTest) {
            const def = LOINC_LAB_TESTS[activeTest.testCode];
            const initialResults: { [key: string]: string } = {};
            def?.parameters.forEach(p => {
                initialResults[p.code] = '';
            });
            setResults(initialResults);
        }
    }, [activeTest]);

    const handleResultChange = (field: string, value: string) => {
        setResults(prev => ({ ...prev, [field]: value }));
    };

    const startTest = () => {
        if (!activeTest) return;
        setActiveTest({ ...activeTest, status: 'PROCESSING' });
    };

    const submitResults = () => {
        if (!activeTest) return;
        console.log('[Lab] Submitting Results:', results);
        setQueue(prev => prev.filter((t: any) => t.id !== activeTest.id));
        setActiveTest(null);
    };

    const activeDef = activeTest ? LOINC_LAB_TESTS[activeTest.testCode] : null;

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden">
            {/* TOP BAR */}
            <header className="h-20 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl z-20">
                <div className="flex items-center gap-6">
                    <Image src="/logo.png" alt="AmisiMedOS" width={40} height={40} className="object-contain" />
                    <div className="h-8 w-[1px] bg-gray-800"></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-purple-500">On-Duty: Diagnostics</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-black/40 border border-white/5 rounded-2xl px-6 py-2 flex items-center gap-3">
                        <Microscope className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Analyzer Link: <span className="text-emerald-500">Active</span></span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* LEFT PANEL: TEST QUEUE */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Order Queue</h2>
                        <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full">{queue.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {queue.map((test: any) => (
                            <button 
                                key={test.id}
                                onClick={() => setActiveTest(test)}
                                className={`w-full p-6 rounded-[32px] border transition-all text-left relative overflow-hidden ${
                                    activeTest?.id === test.id 
                                    ? 'bg-purple-600/10 border-purple-500/50 ring-2 ring-purple-500/20' 
                                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-base truncate pr-4">{test.testName}</h3>
                                    <div className={`h-2 w-2 rounded-full mt-1 ${test.priority === 'STAT' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse' : 'bg-amber-500'}`}></div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                    <span className="uppercase">{test.id} • {test.waitTime}</span>
                                    <span className={`font-black uppercase tracking-widest ${test.priority === 'STAT' ? 'text-rose-500' : 'text-amber-500'}`}>
                                        {test.priority}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* CENTER PANEL: TEST DETAILS & RESULT ENTRY */}
                <main className="flex-1 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden">
                    {activeTest ? (
                        <>
                            <div className="p-8 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-3xl bg-purple-600 flex items-center justify-center font-black text-2xl shadow-2xl shadow-purple-900/40">
                                        {activeTest.patientName[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">{activeTest.testName}</h2>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Patient: {activeTest.patientName} ({activeTest.mrn})</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Ordered By</span>
                                    <span className="text-xs font-black text-purple-400 uppercase">{activeTest.orderedBy}</span>
                                </div>
                            </div>

                            <div className="flex-1 p-10 overflow-y-auto space-y-10 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-8">
                                    {activeDef?.parameters.map((param: LabParameter) => (
                                        <div key={param.code} className="bg-gray-900/60 border border-gray-800 p-8 rounded-[40px] flex flex-col gap-4 relative group">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{param.display}</span>
                                                <Activity className="h-4 w-4 text-purple-500 opacity-20" />
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <input 
                                                    type="text"
                                                    value={results[param.code] || ''}
                                                    onChange={(e) => handleResultChange(param.code, e.target.value)}
                                                    placeholder="0.0"
                                                    className="bg-transparent text-5xl font-black outline-none placeholder:text-gray-800 focus:text-purple-400 transition-colors w-full"
                                                />
                                                <span className="text-xs font-black text-gray-700 uppercase">{param.unit}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                                <span className="text-[9px] font-bold text-gray-600 uppercase">Normal Range</span>
                                                <span className="text-[10px] font-black text-gray-400">{param.range} {param.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-purple-600/5 border border-purple-500/10 p-8 rounded-[40px] flex items-center gap-6">
                                    <FileText className="h-8 w-8 text-purple-500" />
                                    <div>
                                        <h4 className="text-xs font-black text-purple-500 uppercase tracking-tight mb-1">Technician Comments</h4>
                                        <textarea 
                                            rows={2}
                                            className="w-full bg-transparent border-none text-sm text-gray-400 outline-none resize-none placeholder:text-gray-700"
                                            placeholder="Add any morphological findings or quality control notes..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12">
                            <div className="h-24 w-24 rounded-full bg-purple-600/5 flex items-center justify-center mb-8">
                                <FlaskConical className="h-12 w-12 text-purple-500/40" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">No Active Tests</h2>
                            <p className="text-gray-600 text-sm max-w-xs">Select a specimen from the queue to begin processing.</p>
                        </div>
                    )}
                </main>

                {/* RIGHT PANEL: ACTIONS */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex flex-col gap-4 h-full">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Diagnostics Console</h3>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={startTest}
                                disabled={activeTest?.status === 'PROCESSING'}
                                className={`w-full py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                                    activeTest?.status === 'PROCESSING' 
                                    ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-600/30' 
                                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-900/40'
                                }`}
                            >
                                {activeTest?.status === 'PROCESSING' ? (
                                    <>
                                        <Activity className="h-4 w-4 animate-pulse" />
                                        Test in Progress
                                    </>
                                ) : (
                                    <>
                                        <Activity className="h-4 w-4" />
                                        Start Processing
                                    </>
                                )}
                            </button>
                            
                            <button className="w-full py-5 bg-gray-800 hover:bg-gray-700 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                <Upload className="h-4 w-4" />
                                Upload Raw Report
                            </button>
                        </div>

                        <div className="h-[1px] bg-gray-800 my-6"></div>

                        <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl mb-auto">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" /> Panic Alert
                            </h4>
                            <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                Values outside critical limits will trigger an immediate SMS alert to the ordering physician.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-gray-800">
                            <button 
                                onClick={submitResults}
                                disabled={!activeTest || activeTest.status !== 'PROCESSING'}
                                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 shadow-2xl ${
                                    activeTest && activeTest.status === 'PROCESSING'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40' 
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                <CheckCircle2 className="h-6 w-6" />
                                Validate & Notify
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    );
}
