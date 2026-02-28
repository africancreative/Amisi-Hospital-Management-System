'use client';

import { FileText } from 'lucide-react';
import { generatePatientMedicalRecord } from '@/lib/reports';

interface ExportPatientButtonProps {
    patient: any;
    timelineEvents: any[];
    hospitalSettings: any;
}

export default function ExportPatientButton({ patient, timelineEvents, hospitalSettings }: ExportPatientButtonProps) {
    return (
        <button
            onClick={() => generatePatientMedicalRecord(patient, timelineEvents, hospitalSettings)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-gray-700 dark:text-gray-300"
        >
            <FileText className="h-4 w-4 text-emerald-500" />
            Print Medical Record
        </button>
    );
}
