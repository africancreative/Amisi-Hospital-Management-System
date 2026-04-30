'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  Search, 
  UserPlus, 
  Hospital,
  AlertCircle
} from 'lucide-react';
import ClinicalChat from './ClinicalChat';
import { ClinicalNotesPanel } from './ClinicalNotesPanel';

interface ClinicalWorkspaceProps {
  title: string;
  department: 'OPD' | 'ED' | 'IPD' | 'DIAGNOSTICS';
  patient?: {
    id: string;
    name: string;
    mrn: string;
    status: string;
    visitId?: string;
  };
  children: React.ReactNode;
}

/**
 * Global Clinical Workspace Layout
 * 
 * Standardizes the 'Clinical Collaborative' model across all departments.
 * Features a flexible center stage for procedures and a persistent 
 * side-hub for chat and longitudinal notes.
 */
export function ClinicalWorkspace({ title, department, patient, children }: ClinicalWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'NOTES'>('CHAT');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-full bg-gray-950 overflow-hidden">
      {/* 1. Header & Navigation */}
      <header className="h-16 flex items-center justify-between px-6 bg-gray-900/50 border-b border-gray-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${
            department === 'ED' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
          }`}>
            <Hospital className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white uppercase">{title}</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{department} CORE WORKSPACE</p>
          </div>
        </div>

        {patient && (
          <div className="flex items-center gap-4 bg-gray-950/80 px-4 py-2 rounded-xl border border-gray-800 shadow-inner">
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">{patient.name}</span>
              <span className="text-[10px] text-gray-500 font-mono">{patient.mrn}</span>
            </div>
            <div className="h-8 w-[1px] bg-gray-800 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-500 uppercase">{patient.status}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button className="h-9 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
             <Search className="h-3.5 w-3.5" />
             Patient Lookup
          </button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Center Stage: Procedure Forms & Modules */}
        <section className="flex-1 overflow-y-auto bg-gray-950/50 p-6 scrollbar-hide">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </section>

        {/* Dynamic Side-Hub: Collaboration & Records */}
        <aside className={`${isSidebarOpen ? 'w-96' : 'w-0'} transition-all duration-300 flex flex-col border-l border-gray-800 bg-gray-900/20`}>
          {isSidebarOpen && patient && (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-800 p-1 m-4 bg-gray-950/50 rounded-lg shrink-0">
                <button 
                  onClick={() => setActiveTab('CHAT')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'CHAT' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Clinical Chat
                </button>
                <button 
                  onClick={() => setActiveTab('NOTES')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'NOTES' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Visit Notes
                </button>
              </div>

              {/* Active Hub Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'CHAT' ? (
                  <ClinicalChat patientId={patient.id} visitId={patient.visitId} />
                ) : (
                  <ClinicalNotesPanel patientId={patient.id} visitId={patient.visitId} />
                )}
              </div>
            </>
          )}

          {!patient && isSidebarOpen && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="p-4 rounded-full bg-gray-900 border border-gray-800 mb-4 opacity-50">
                <AlertCircle className="h-8 w-8 text-gray-600" />
              </div>
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">No Active Context</h4>
              <p className="text-[10px] text-gray-600 uppercase font-medium">Please select a patient to enable the collaboration hub.</p>
            </div>
          )}
        </aside>

        {/* Sidebar Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-4 bg-gray-800 border-l border-y border-gray-700 rounded-l-lg flex items-center justify-center text-gray-500 hover:text-emerald-500 hover:bg-gray-750 transition-all z-10"
        >
          <ChevronRight className={`h-3 w-3 transition-transform ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </main>
    </div>
  );
}
