import Link from 'next/link';
import { ArrowLeft, Stethoscope, Save, Heart, Activity, Thermometer, Scale, ClipboardEdit } from 'lucide-react';
import { createEncounter } from '@/app/actions/ehr-actions';

export default function NewEncounterPage({ params }: { params: { id: string } }) {
    const patientId = params.id;

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 font-black">
                    <Link
                        href={`/patients/${patientId}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Patient
                    </Link>
                    <h1 className="text-4xl tracking-tight text-gray-900 dark:text-white">New Clinical Encounter</h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Record findings, vitals, and management plan for this visit.
                    </p>
                </header>

                <form action={createEncounter.bind(null, patientId)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Encounter Metadata */}
                        <section className="space-y-6">
                            <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-6">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" />
                                    Visit Metadata
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Doctor Name</label>
                                    <input name="doctorName" required placeholder="Dr. Amisi" className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Encounter Type</label>
                                    <select name="type" required className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold">
                                        <option value="Initial Consultation">Initial Consultation</option>
                                        <option value="Follow-up">Follow-up</option>
                                        <option value="Routine Checkup">Routine Checkup</option>
                                        <option value="Emergency Visit">Emergency Visit</option>
                                    </select>
                                </div>
                            </div>

                            {/* Vitals Input */}
                            <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-6">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Vitals Entry
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                            <Activity className="h-3 w-3" /> BP (120/80)
                                        </label>
                                        <input name="bloodPressure" className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                            <Heart className="h-3 w-3" /> Pulse
                                        </label>
                                        <input name="heartRate" type="number" className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                            <Thermometer className="h-3 w-3" /> Temp (°C)
                                        </label>
                                        <input name="temperature" type="number" step="0.1" className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                            <Scale className="h-3 w-3" /> Weight (kg)
                                        </label>
                                        <input name="weight" type="number" step="0.1" className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Clinical Notes & Plan */}
                        <section className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm flex flex-col h-full">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
                                <ClipboardEdit className="h-4 w-4" />
                                Medical Assessment
                            </h2>

                            <div className="flex-1 space-y-6 flex flex-col">
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Clinical Findings / Notes</label>
                                    <textarea
                                        name="notes"
                                        className="w-full flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 min-h-[200px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none leading-relaxed"
                                        placeholder="Patient presents with persistent cough and occasional fever..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mt-6">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Management Plan</label>
                                <textarea
                                    name="plan"
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none leading-relaxed"
                                    placeholder="Prescribed antibiotics, follow-up in 7 days..."
                                />
                            </div>
                        </section>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-5 font-black text-lg text-white shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-[0.98]"
                        >
                            <Save className="h-6 w-6" />
                            Finalize & Save Encounter
                        </button>
                        <Link
                            href={`/patients/${patientId}`}
                            className="px-8 py-5 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 font-black hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            Discard
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
