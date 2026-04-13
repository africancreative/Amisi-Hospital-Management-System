import Link from 'next/link';
import { Plus, User, Search, Calendar, ChevronRight, UserPlus } from 'lucide-react';
import { getPatients } from '@/app/actions/ehr-actions';

export default async function PatientsPage(
    props: {
        params: Promise<{ slug: string }>;
        searchParams: Promise<{ q?: string }>;
    }
) {
    const { slug } = await props.params;
    const { q } = await props.searchParams;
    const patients = await getPatients(q);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Patient Directory</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Search, manage, and register patients for this hospital.
                        </p>
                    </div>
                    <Link
                        href={`/${slug}/patients/new`}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white shadow hover:bg-emerald-600 transition-colors"
                    >
                        <UserPlus className="h-5 w-5" />
                        Register Patient
                    </Link>
                </header>

                {/* Search Bar */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <form method="GET">
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search by name, ID or phone..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </form>
                </div>

                <div className="grid gap-4">
                    {patients.map((patient) => (
                        <Link
                            key={patient.id}
                            href={`/${slug}/patients/${patient.id}`}
                            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm hover:border-emerald-500/50 transition-all group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                        {patient.lastName}, {patient.firstName}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1" suppressHydrationWarning>
                                            <Calendar className="h-3.5 w-3.5" />
                                            DOB: {new Date(patient.dob).toLocaleDateString()}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                        <span className="uppercase text-xs font-semibold">{patient.gender || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                        </Link>
                    ))}

                    {patients.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-gray-900 dark:text-white font-medium">No patients found</h3>
                            <p className="text-gray-500 mt-1">Try a different search term or register a new patient.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
