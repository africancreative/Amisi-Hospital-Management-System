import React from 'react';
import { getHospitalSettings } from '@/app/actions/hospital-actions';
import HospitalBrandingForm from '@/components/HospitalBrandingForm';
import { Settings, ShieldCheck } from 'lucide-react';

export default async function SettingsModule({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const settings = await getHospitalSettings();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-5xl">
                <header className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3"><Settings className="h-10 w-10 text-emerald-500" /> Platform Settings</h1>
                    <p className="text-gray-500 font-medium mt-2">Configure hospital infrastructure and branding for <span className="text-emerald-500 font-bold uppercase">{slug.replace('-', ' ')}</span>.</p>
                </header>
                <div className="space-y-10">
                    <section><HospitalBrandingForm initialSettings={settings} /></section>
                    <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6"><ShieldCheck className="h-6 w-6 text-blue-500" /><h3 className="text-xl font-black">Regional Compliance</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl"><p className="text-xs font-black text-blue-600 uppercase mb-1">Taxation Model</p><p className="text-sm font-bold">Standard VAT</p></div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
