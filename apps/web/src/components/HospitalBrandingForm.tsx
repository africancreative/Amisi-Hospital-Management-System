'use client';

import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Tag, Palette, Globe, Save } from 'lucide-react';
import { updateHospitalBranding } from '@/app/actions/hospital-actions';

interface HospitalBrandingFormProps {
    initialSettings: any;
}

export default function HospitalBrandingForm({ initialSettings }: HospitalBrandingFormProps) {
    const [isSaving, setIsSaving] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        try {
            await updateHospitalBranding(formData);
            alert('Branding updated successfully!');
        } catch (e) {
            alert('Failed to update branding');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form action={handleSubmit} className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden font-sans">
            <div className="p-8 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="text-xl font-black flex items-center gap-3">
                    <Palette className="h-6 w-6 text-emerald-500" />
                    Hospital Identity & Branding
                </h3>
                <p className="text-gray-500 text-sm mt-1">Configure how your hospital appears on official PDF documents and reports.</p>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Branding */}
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Hospital Display Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                name="hospitalName"
                                defaultValue={initialSettings.hospitalName}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="e.g., Amisi General Hospital"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Marketing Slogan</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                name="marketingSlogan"
                                defaultValue={initialSettings.marketingSlogan}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all italic"
                                placeholder="e.g., Excellence in Healthcare"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Logo URL (Public)</label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                name="logoUrl"
                                defaultValue={initialSettings.logoUrl}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Tax Details */}
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Tax ID / PIN</label>
                        <div className="relative">
                            <Save className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                name="taxId"
                                defaultValue={initialSettings.taxId}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                                placeholder="KRA PIN / TIN"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Contact Phone & Email</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    name="phone"
                                    defaultValue={initialSettings.phone}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="+254..."
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    name="contactEmail"
                                    defaultValue={initialSettings.contactEmail}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="info@..."
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Detailed Address (Footer)</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                            <textarea
                                name="detailedAddress"
                                defaultValue={initialSettings.detailedAddress}
                                rows={3}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                                placeholder="Full physical address for official documents..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                <button
                    disabled={isSaving}
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-bold text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                    {isSaving ? 'Saving Changes...' : 'Save Branding Identity'}
                </button>
            </div>
        </form>
    );
}
