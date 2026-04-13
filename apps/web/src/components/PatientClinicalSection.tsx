'use client';

import { useState } from 'react';
import { FileText, Stethoscope } from 'lucide-react';
import MedicalTimeline from './MedicalTimeline';
import SoapNoteEditor from './SoapNoteEditor';

export default function PatientClinicalSection({ patientId }: { patientId: string }) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    return (
        <section className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-emerald-500" />
                    Clinical Timeline
                </h2>
                <button
                    onClick={() => setIsEditorOpen(true)}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-500/30"
                >
                    <FileText className="h-4 w-4" />
                    Record Note
                </button>
            </div>
            
            <div className="p-0">
                <MedicalTimeline patientId={patientId} />
            </div>

            {isEditorOpen && (
                <SoapNoteEditor 
                    patientId={patientId} 
                    onClose={() => setIsEditorOpen(false)} 
                />
            )}
        </section>
    );
}
