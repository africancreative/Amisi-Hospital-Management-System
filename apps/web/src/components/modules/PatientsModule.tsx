import React from 'react';
import Link from 'next/link';
import { User, Search, Calendar, ChevronRight, UserPlus } from 'lucide-react';
import { getPatients } from '@/app/actions/clinical-actions';

export default async function PatientsModule({ params, searchParams }: { params: { slug: string }, searchParams?: { q?: string } }) {
    const { slug } = params;
    const q = searchParams?.q;
    const patients = await getPatients(q);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Patient Directory</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Search, manage, and register patients for this hospital.</p>
                    </div>
                    <Link href={`/${slug}/patients/new`} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white shadow hover:bg-emerald-600 transition-colors">
                        <UserPlus className="h-5 w-5" /> Register Patient
                    </Link>
                </header>
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <form method="GET">
                        <input type="text" name="q" defaultValue={q} placeholder="Search by name, ID or phone..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                    </form>
                </div>
                <div className="grid gap-4">
                    {patients.map((patient: any) => (
                        <Link key={patient.id} href={`/${slug}/patients/${patient.id}`} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-emerald-500/50 transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center"><User className="h-6 w-6 text-emerald-600" /></div>
                                <div><h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-500 transition-colors">{patient.lastName}, {patient.firstName}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500"><span className="flex items-center gap-1">DOB: {new Date(patient.dob).toLocaleDateString()}</span><span className="uppercase text-xs font-semibold">{patient.gender || 'N/A'}</span></div></div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
