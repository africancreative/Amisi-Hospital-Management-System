'use client';

import React from 'react';
import dynamicImport from 'next/dynamic';

const LoadingModule = () => (
    <div className="h-screen w-full bg-[#07070a] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
    </div>
);

// High-Fidelity Clinical Dashboards (Client Components)
const DoctorDashboard = dynamicImport(() => import('@/components/clinical/DoctorDashboard'), { ssr: false, loading: () => <LoadingModule /> });
const LabDashboard = dynamicImport(() => import('@/components/clinical/LabDashboard'), { ssr: false, loading: () => <LoadingModule /> });
const TriageDashboard = dynamicImport(() => import('@/components/clinical/TriageDashboard'), { ssr: false, loading: () => <LoadingModule /> });
const PharmacistDashboard = dynamicImport(() => import('@/components/clinical/PharmacistDashboard'), { ssr: false, loading: () => <LoadingModule /> });
const WardDashboard = dynamicImport(() => import('@/components/clinical/WardDashboard'), { ssr: false, loading: () => <LoadingModule /> });
const InventoryDashboard = dynamicImport(() => import('@/components/clinical/InventoryDashboard'), { ssr: false, loading: () => <LoadingModule /> });
const FinanceDashboard = dynamicImport(() => import('@/components/clinical/FinanceDashboard'), { ssr: false, loading: () => <LoadingModule /> });
const CashierDashboard = dynamicImport(() => import('@/components/clinical/CashierDashboard'), { ssr: false, loading: () => <LoadingModule /> });

// Typed dynamic imports for components with props
const ClinicalChat = dynamicImport<{ patientId: string }>(() => import('@/components/clinical/ClinicalChat'), { ssr: false, loading: () => <LoadingModule /> });
const PatientEMR = dynamicImport<{ patientId: string }>(() => import('@/components/clinical/PatientEMR'), { ssr: false, loading: () => <LoadingModule /> });

interface ModuleClientDispatcherProps {
    mainModule: string;
    subPath: string[];
    slug: string;
}

export default function ModuleClientDispatcher({ mainModule, subPath, slug }: ModuleClientDispatcherProps) {
    switch (mainModule) {
        case 'doctor':
            return <DoctorDashboard />;
        case 'lab':
        case 'laboratory':
            return <LabDashboard />;
        case 'triage':
            return <TriageDashboard />;
        case 'pharmacy-on-duty':
            return <PharmacistDashboard />;
        case 'ward-on-duty':
            return <WardDashboard />;
        case 'inventory-on-duty':
            return <InventoryDashboard />;
        case 'finance-on-duty':
            return <FinanceDashboard />;
        case 'billing-on-duty':
            return <CashierDashboard />;
        case 'chat':
            return <ClinicalChat patientId="" />;
        case 'emr':
            if (subPath.length === 1) return <PatientEMR patientId={subPath[0]} />;
            return null; // Should be handled by server dispatcher
        default:
            return null;
    }
}
