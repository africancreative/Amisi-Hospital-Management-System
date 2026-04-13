'use client';

import React from 'react';
import { FileText, Plus, User, Clock } from 'lucide-react';
import { api } from '@/trpc/react';
import { format } from 'date-fns';

interface ClinicalNotesPanelProps {
  patientId: string;
  visitId?: string;
  encounterId?: string;
}

/**
 * Structural Clinical Notes Component
 * 
 * Manages SOAP notes and Nursing reports. 
 * High-fidelity, read-only list with 'Create' logic integrated into workspaces.
 */
export function ClinicalNotesPanel({ patientId, visitId, encounterId }: ClinicalNotesPanelProps) {
  // 1. Fetch Notes
  const { data: notes } = api.clinical.getVisitNotes.useQuery({ 
    visitId: visitId || '' 
  }, { 
    enabled: !!visitId 
  });

  return (
    <div className="flex h-full flex-col bg-gray-950/20">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
        <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Clinical Records</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notes?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600 grayscale">
            <FileText className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-xs font-medium uppercase tracking-tighter">No records found for this visit</p>
          </div>
        )}

        {notes?.map((note) => (
          <div key={note.id} className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>
            <div className="relative bg-gray-900/40 border border-gray-800 rounded-xl p-4 shadow-xl hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                    <User className="h-3 w-3 text-orange-400" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase">{note.type} Note</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                  <Clock className="h-3 w-3" />
                  {format(new Date(note.createdAt), 'MMM d, HH:mm')}
                </div>
              </div>

              <div className="space-y-3">
                {note.subjective && (
                  <div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-0.5">Subjective</span>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{note.subjective}"</p>
                  </div>
                )}
                {note.objective && (
                  <div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-0.5">Objective</span>
                    <p className="text-sm text-gray-300 leading-relaxed font-medium">{note.objective}</p>
                  </div>
                )}
                {note.plan && (
                  <div>
                    <span className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest block mb-0.5">Plan</span>
                    <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <p className="text-sm text-emerald-100/80 leading-relaxed">{note.plan}</p>
                    </div>
                  </div>
                )}
                {note.content && (
                  <p className="text-sm text-gray-400 mt-2">{note.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
