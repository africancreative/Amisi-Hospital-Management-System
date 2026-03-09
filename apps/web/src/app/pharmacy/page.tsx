import {
    Pill,
    Search,
    User,
    Clock,
    ChevronRight,
    FlaskConical,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Stethoscope
} from 'lucide-react';
import Link from 'next/link';
import { getPendingPrescriptions } from '@/app/actions/pharmacy-actions';

export default async function PharmacyPage() {
    const prescriptions = await getPendingPrescriptions();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                <Pill className="h-10 w-10 text-blue-500" />
                                Pharmacy Worklist
                            </h1>
                            <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">
                                Patient Medication Dispensing Hub
                            </p>
                        </div>

                        <div className="flex bg-white dark:bg-gray-805 rounded-2xl border border-gray-200 dark:border-gray-800 p-1 shadow-sm font-black text-[10px] uppercase tracking-widest">
                            <button className="px-6 py-2 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">Pending Queue</button>
                            <button className="px-6 py-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">Dispensed History</button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {prescriptions.map((px) => (
                        <div key={px.id} className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm hover:border-blue-500/30 transition-all group overflow-hidden relative">
                            {/* Decorative Background Icon */}
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <Pill className="h-48 w-48 rotate-12" />
                            </div>

                            <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                                {/* Left Side: Patient & Meta */}
                                <div className="flex gap-6 min-w-[300px]">
                                    <div className="h-20 w-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
                                        <User className="h-10 w-10 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">{px.patient.lastName}, {px.patient.firstName}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-gray-500">
                                            <span className="flex items-center gap-1.5 border-r border-gray-200 dark:border-gray-800 pr-4" suppressHydrationWarning>
                                                <Calendar className="h-3.5 w-3.5" />
                                                Age: {calculateAge(px.patient.dob)}
                                            </span>
                                            <span className="flex items-center gap-1.5 border-r border-gray-200 dark:border-gray-800 pr-4" suppressHydrationWarning>
                                                <Clock className="h-3.5 w-3.5" />
                                                Ordered {new Date(px.createdAt).toLocaleTimeString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Stethoscope className="h-3.5 w-3.5" />
                                                Dr. {px.orderedBy}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <span className="px-2.5 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Action Required
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center: Meds List */}
                                <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-900">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">Prescribed Items</h4>
                                    <div className="space-y-4">
                                        {px.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between px-2 bg-white dark:bg-gray-950 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                                        <Pill className="h-4 w-4 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black">{item.drugName} {item.dosage}</p>
                                                        <p className="text-[10px] font-bold text-gray-400">{item.frequency} • {item.duration}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-gray-900 dark:text-white">QTY: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex flex-col justify-center gap-3">
                                    <button className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95">
                                        Dispense Meds
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                    <button className="px-8 py-4 bg-white dark:bg-gray-950 text-gray-500 border border-gray-200 dark:border-gray-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center justify-center gap-2">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {prescriptions.length === 0 && (
                        <div className="bg-white dark:bg-gray-950 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800 p-20 text-center">
                            <div className="h-20 w-20 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-400">Queue is Clear</h3>
                            <p className="text-gray-500 font-medium">No pending prescriptions found in the worklist.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function calculateAge(dob: Date | string) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
