import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
    FlaskConical,
    ArrowLeft,
    Save,
    Beaker,
    User,
    ClipboardList
} from 'lucide-react';
import { getLabOrderWithResults, recordLabResult } from '@/app/actions/lab-actions';

export default async function LabEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getLabOrderWithResults(id);

    if (!order) {
        notFound();
    }

    async function handleSubmit(formData: FormData) {
        'use server';
        const technicianName = formData.get('technicianName') as string;
        // Mock parsing parameters - in prod this would be a dynamic list
        const results = [
            {
                parameter: formData.get('param1_name') as string,
                value: formData.get('param1_value') as string,
                unit: formData.get('param1_unit') as string,
                range: formData.get('param1_range') as string,
                flag: formData.get('param1_flag') as string,
            }
        ].filter(r => r.parameter && r.value);

        await recordLabResult(id, results, technicianName);
        redirect('/lab');
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="mx-auto max-w-3xl">
                <header className="mb-10">
                    <Link
                        href="/lab"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Worklist
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Beaker className="h-10 w-10 text-blue-500" />
                        Result Entry
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">
                        Test: {order.testPanelId} • Patient: {order.patient ? `${order.patient.lastName}, ${order.patient.firstName}` : 'Unknown'}
                    </p>
                </header>

                <form action={handleSubmit} className="space-y-8">
                    <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Technician Information
                        </h2>
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Reporting Technician</span>
                                <input
                                    name="technicianName"
                                    type="text"
                                    required
                                    placeholder="Enter your name"
                                    className="mt-2 block w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </label>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Test Parameters
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                            <div className="md:col-span-2">
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Parameter Name</span>
                                    <input name="param1_name" defaultValue={order.testPanelId} className="mt-2 block w-full bg-white dark:bg-gray-900 border-0 rounded-xl px-4 py-3 font-bold" />
                                </label>
                            </div>
                            <div>
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Measured Value</span>
                                    <input name="param1_value" required placeholder="e.g. 14.5" className="mt-2 block w-full bg-white dark:bg-gray-900 border-0 rounded-xl px-4 py-3 font-black text-blue-500" />
                                </label>
                            </div>
                            <div>
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Unit</span>
                                    <input name="param1_unit" placeholder="e.g. g/dL" className="mt-2 block w-full bg-white dark:bg-gray-900 border-0 rounded-xl px-4 py-3" />
                                </label>
                            </div>
                            <div>
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Ref. Range</span>
                                    <input name="param1_range" placeholder="e.g. 13.5 - 17.5" className="mt-2 block w-full bg-white dark:bg-gray-900 border-0 rounded-xl px-4 py-3" />
                                </label>
                            </div>
                            <div>
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Flag</span>
                                    <select name="param1_flag" className="mt-2 block w-full bg-white dark:bg-gray-900 border-0 rounded-xl px-4 py-3 font-bold">
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                        <option value="Low">Low</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        className="w-full py-5 bg-blue-500 text-white rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-95"
                    >
                        <Save className="h-6 w-6" />
                        Finalize & Sync Results
                    </button>
                </form>
            </div>
        </div>
    );
}
