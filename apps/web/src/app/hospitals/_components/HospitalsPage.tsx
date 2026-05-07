import Link from 'next/link';
import { Plus, Building2, MapPin, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { getTenants } from '@/app/actions/core-actions';

export default async function HospitalsPage() {
    const tenants = await getTenants();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Hospital Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your global network of hospital tenants.
                        </p>
                    </div>
                    <Link
                        href="/hospitals/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white shadow hover:bg-emerald-600 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Hospital
                    </Link>
                </header>

                <div className="grid gap-6">
                    {tenants.map((tenant: any) => (
                        <div
                            key={tenant.id}
                            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm hover:border-emerald-500/50 transition-all duration-300 group"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                                        <Building2 className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                            {tenant.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {tenant.region}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                            <span className="flex items-center gap-1">
                                                <ShieldCheck className="h-4 w-4" />
                                                {tenant.id.slice(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="flex flex-col items-end">
                                        <StatusBadge status={tenant.status} />
                                        <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                                            Joined {new Date(tenant.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/hospitals/${tenant.id}`}
                                        className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 dark:border-gray-900 pt-4">
                                {Object.entries(tenant.enabledModules as Record<string, boolean>).map(([key, value]) => (
                                    value && (
                                        <span
                                            key={key}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 uppercase tracking-wider"
                                        >
                                            {key}
                                        </span>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}

                    {tenants.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-gray-900 dark:text-white font-medium">No hospitals found</h3>
                            <p className="text-gray-500 mt-1">Get started by adding your first hospital tenant.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: Record<string, { bg: string, text: string, icon: any }> = {
        active: {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-800 dark:text-emerald-400',
            icon: Activity
        },
        suspended: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-800 dark:text-yellow-400',
            icon: AlertCircle
        },
        terminated: {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-800 dark:text-red-400',
            icon: AlertCircle
        },
    };

    const config = configs[status] || configs.active;
    const Icon = config.icon as any;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${config.bg} ${config.text}`}>
            <Icon className="h-3.5 w-3.5" />
            {status}
        </span>
    );
}
