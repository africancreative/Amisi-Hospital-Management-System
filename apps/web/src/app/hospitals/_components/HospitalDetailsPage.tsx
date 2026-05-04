import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    Settings,
    Shield,
    Activity,
    Database,
    Globe,
    AlertCircle,
    Eye,
    Trash2,
    Lock,
    Unlock,
    Hospital,
    Microscope,
    FlaskConical,
    BadgePercent,
    Stethoscope,
    Boxes,
    FileText,
    HeartPulse,
    Search,
    CheckCircle2
} from 'lucide-react';
import { getTenantById, updateTenantStatus, updateEnabledModules } from '@/app/actions/tenant-actions';

const DOMAINS = [
    {
        id: 'pmi_domain',
        name: 'Patient Identity (PMI)',
        icon: Hospital,
        modules: [{ id: 'pmi', name: 'PMI', description: 'Patient Master Index' }]
    },
    {
        id: 'opd_domain',
        name: 'Outpatient Care (OPD)',
        icon: Stethoscope,
        modules: [{ id: 'opd', name: 'OPD', description: 'Ambulatory Services' }]
    },
    {
        id: 'ipd_domain',
        name: 'Inpatient Care (IPD)',
        icon: Activity,
        modules: [{ id: 'ipd', name: 'IPD', description: 'Inpatient Management' }]
    },
    {
        id: 'rcm_domain',
        name: 'Revenue Cycle (RCM)',
        icon: BadgePercent,
        modules: [{ id: 'rcm', name: 'RCM', description: 'Billing & Invoicing' }]
    },
    {
        id: 'pharmacy_domain',
        name: 'Pharmacy Services',
        icon: FlaskConical,
        modules: [{ id: 'pharmacy', name: 'Pharmacy', description: 'Medications' }]
    },
    {
        id: 'lab_domain',
        name: 'Laboratory (LIS)',
        icon: Microscope,
        modules: [{ id: 'lis', name: 'LIS', description: 'Test Results' }]
    },
    {
        id: 'ris_domain',
        name: 'Radiology (RIS)',
        icon: Shield, // Using Shield as a proxy for imaging/security
        modules: [{ id: 'ris', name: 'RIS', description: 'Imaging & PACS' }]
    },
    {
        id: 'inventory_domain',
        name: 'Inventory & Supply',
        icon: Boxes,
        modules: [{ id: 'inventory', name: 'Inventory', description: 'Stock Mgmt' }]
    },
    {
        id: 'research_care',
        name: 'Critical & Research',
        icon: Search,
        modules: [
            { id: 'ot', name: 'OT', description: 'Operation Theatre' },
            { id: 'icu', name: 'ICU', description: 'Intense Care' },
            { id: 'ctms', name: 'CTMS', description: 'Clinical Trials' },
            { id: 'irb', name: 'IRB', description: 'Ethics Board' }
        ]
    }
];

export default async function HospitalDetailPage(
    props: {
        params: Promise<{ id: string }>;
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }
) {
    const params = await props.params;
    const tenant = await getTenantById(params.id);

    if (!tenant) {
        notFound();
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="mx-auto max-w-6xl">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <Link
                            href="/hospitals"
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline mb-4"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Hospital Registry
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black tracking-tight">{tenant.name}</h1>
                            <TierBadge tier={tenant.tier} />
                            <StatusBadge status={tenant.status} />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2 text-sm font-medium">
                            <Globe className="h-4 w-4" /> {tenant.region} • <Database className="h-4 w-4 ml-2" /> ID: {tenant.id.split('-')[0]} • <Globe className="h-4 w-4 ml-2" /> Slug: /{tenant.slug}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <form action={async () => {
                            'use server';
                            await updateTenantStatus(tenant.id, tenant.status === 'suspended' ? 'active' : 'suspended');
                        }}>
                            <button
                                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tenant.status === 'suspended'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {tenant.status === 'suspended' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                {tenant.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </button>
                        </form>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-10">
                        {/* Domain Grouped Modules */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Functional Domains</h2>
                                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 ml-6"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {DOMAINS.map((domain: any) => {
                                    const Icon = domain.icon;
                                    return (
                                        <div key={domain.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
                                            <div className="p-4 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                    <Icon className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <h3 className="text-xs font-black uppercase tracking-widest">{domain.name}</h3>
                                            </div>
                                            <div className="p-4 grid grid-cols-1 gap-3">
                                                {domain.modules.map((mod: any) => (
                                                    <ModuleCard
                                                        key={mod.id}
                                                        tenantId={tenant.id}
                                                        moduleKey={mod.id}
                                                        name={mod.name}
                                                        description={mod.description}
                                                        enabled={!!(tenant.enabledModules as any)[mod.id]}
                                                        currentModules={tenant.enabledModules}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Infrastructure */}
                        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <Database className="h-3 w-3" /> Connectivity
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-2">Neon Isolated URL</label>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-[10px] font-mono text-gray-500 break-all border border-gray-100 dark:border-gray-800">
                                        {tenant.dbUrl.replace(/:([^:@]+)@/, ':****@')}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-900">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Encryption Ref</span>
                                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">{tenant.encryptionKeyReference.split('-').pop()}</span>
                                </div>
                            </div>
                        </section>

                        {/* Telemetry */}
                        <section className="rounded-2xl bg-gray-900 p-6 text-white shadow-2xl overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 text-emerald-500/10 rotate-12">
                                <Activity className="h-32 w-32" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2 relative z-10">
                                <Activity className="h-3 w-3" /> Live Telemetry
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="opacity-50 font-medium">Sync Latency</span>
                                    <span className="font-black text-emerald-400">42ms</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="opacity-50 font-medium">Active Nodes</span>
                                    <span className="font-black">1 Edge (On-site)</span>
                                </div>
                            </div>
                            <button className="w-full mt-8 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Flush Registry Cache
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TierBadge({ tier }: { tier: string }) {
    const configs: any = {
        CLINIC: 'border-blue-500 text-blue-500 bg-blue-500/5',
        GENERAL: 'border-emerald-500 text-emerald-500 bg-emerald-500/5',
        RESEARCH: 'border-purple-500 text-purple-500 bg-purple-500/5'
    };
    return (
        <span className={`px-2 py-0.5 border rounded-md text-[10px] font-black uppercase tracking-widest ${configs[tier]}`}>
            Tier: {tier}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isSuspended = status === 'suspended';
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isSuspended ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${isSuspended ? 'bg-orange-500' : 'bg-emerald-500 animate-pulse'}`} />
            {status}
        </span>
    );
}

function ModuleCard({ tenantId, currentModules, moduleKey, name, description, enabled }: { tenantId: string, currentModules: any, moduleKey: string, name: string, description: string, enabled: boolean }) {
    return (
        <form action={async () => {
            'use server';
            const updatedModules = { ...currentModules as any, [moduleKey]: !enabled };
            await updateEnabledModules(tenantId, updatedModules);
        }}>
            <button
                type="submit"
                className={`w-full text-left p-3 rounded-xl border transition-all hover:bg-gray-50 dark:hover:bg-gray-900 group ${enabled
                    ? 'border-emerald-500/20 bg-emerald-500/5 shadow-sm shadow-emerald-500/5'
                    : 'border-gray-100 dark:border-gray-900 bg-gray-50/30'
                    }`}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <div className={`text-xs font-black ${enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {name}
                        </div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-tight mt-0.5">{description}</div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${enabled ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 dark:border-gray-800'}`}>
                        {enabled && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                    </div>
                </div>
            </button>
        </form>
    );
}
