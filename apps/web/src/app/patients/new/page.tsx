import Link from 'next/link';
import { ArrowLeft, UserPlus, User, Calendar, Activity, HeartPulse } from 'lucide-react';
import { createPatient } from '../../actions/ehr-actions';

export default function NewPatientPage() {
    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-2xl">
                <header className="mb-8">
                    <Link
                        href="/patients"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Directory
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Register New Patient</h1>
                    <p className="text-gray-500 mt-1">
                        Carefully enter patient demographics to ensure accurate record matching.
                    </p>
                </header>

                <form action={createPatient} className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 shadow-sm space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">First Name</label>
                                <input name="firstName" required className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Last Name</label>
                                <input name="lastName" required className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Date of Birth</label>
                                <input type="date" name="dob" required className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Gender</label>
                                <select name="gender" required className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                            <HeartPulse className="h-5 w-5 text-emerald-500 shrink-0" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium italic">
                                All patient data is encrypted at rest using tenant-isolated KMS keys.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:-translate-y-0.5"
                        >
                            <UserPlus className="h-5 w-5" />
                            Complete Registration
                        </button>
                        <Link
                            href="/patients"
                            className="px-8 py-4 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
