"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    Building2,
    Map,
    Database,
    Mail,
    Phone,
    MapPin,
    BadgePercent,
    MessageSquare,
    Image as ImageIcon,
    Shield,
    CheckCircle2,
    Hospital,
    Microscope,
    FlaskConical,
    Activity,
    Stethoscope,
    Boxes,
    Search,
    Image,
    UserCircle,
    Key,
    Globe
} from 'lucide-react';
import { createTenant } from '@/app/actions/tenant-actions';
import { PayPalCheckoutButton } from '@/components/billing/PayPalCheckoutButton';

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
        icon: Image,
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

const TIER_DEFAULTS: Record<string, string[]> = {
    CLINIC: ['pmi', 'opd', 'pharmacy', 'rcm'],
    GENERAL: ['pmi', 'opd', 'pharmacy', 'rcm', 'ipd', 'lis', 'ris', 'inventory'],
    RESEARCH: ['pmi', 'opd', 'pharmacy', 'rcm', 'ipd', 'lis', 'ris', 'inventory', 'ot', 'icu', 'ctms', 'irb']
};

export default function NewHospitalPage() {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [tier, setTier] = useState<string>('CLINIC');
    const [selectedModules, setSelectedModules] = useState<string[]>(TIER_DEFAULTS.CLINIC);
    const [isPaid, setIsPaid] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    // Auto-generate slug from name
    useEffect(() => {
        const generated = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setSlug(generated);
    }, [name]);

    const handleTierChange = (newTier: string) => {
        setTier(newTier);
        setSelectedModules(TIER_DEFAULTS[newTier]);
    };

    const toggleModule = (moduleId: string) => {
        setSelectedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter((m: any) => m !== moduleId)
                : [...prev, moduleId]
        );
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8">
                    <Link
                        href="/hospitals"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Hospitals
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Onboard New Hospital</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Select a deployment tier and functional modules to initialize.
                    </p>
                </header>

                <form action={createTenant} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Basic Identity
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="name" className="text-[10px] font-black uppercase text-gray-500">Hospital Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="slug" className="text-[10px] font-black uppercase text-gray-500">URL Identifier (Slug)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 text-xs font-mono">
                                            amisigenuine.com/
                                        </div>
                                        <input
                                            type="text"
                                            id="slug"
                                            name="slug"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 pl-28 pr-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Unique path-based routing ID</p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                <Database className="h-4 w-4" /> Infrastructure
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="region" className="text-[10px] font-black uppercase text-gray-500">Deployment Region</label>
                                    <select id="region" name="region" required className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                                        <option value="US-East (N. Virginia)">US-East (N. Virginia)</option>
                                        <option value="US-West (Oregon)">US-West (Oregon)</option>
                                        <option value="EU-West (Ireland)">EU-West (Ireland)</option>
                                        <option value="AF-South (Cape Town)">AF-South (Cape Town)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="dbUrl" className="text-[10px] font-black uppercase text-gray-500">Isolated Database URL</label>
                                    <input type="text" id="dbUrl" name="dbUrl" required className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Hospital Administrator */}
                    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-900 pb-4 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <UserCircle className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Initial Hospital Administrator</h3>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Primary superuser account for this facility</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label htmlFor="adminName" className="text-[10px] font-black uppercase text-gray-500">Full Name</label>
                                <input type="text" id="adminName" name="adminName" required placeholder="e.g. Dr. Jane Smith" className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="adminEmail" className="text-[10px] font-black uppercase text-gray-500">Admin Email</label>
                                <input type="email" id="adminEmail" name="adminEmail" required placeholder="admin@hospital.com" className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="adminPassword" className="text-[10px] font-black uppercase text-gray-500">Secure Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <input type="password" id="adminPassword" name="adminPassword" required className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Deployment Tier */}
                    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-black uppercase tracking-widest">Select Deployment Tier</h3>
                        </div>
                        <div className="p-6">
                            <input type="hidden" name="tier" value={tier} />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'CLINIC', name: 'Tier 1: Clinic', desc: 'Essential Clinical Care', color: 'bg-blue-500' },
                                    { id: 'GENERAL', name: 'Tier 2: Hospital', desc: 'Full Diagnostics & IPD', color: 'bg-emerald-500' },
                                    { id: 'RESEARCH', name: 'Tier 3: Research', desc: 'Critical Care & Academic', color: 'bg-purple-500' }
                                ].map((t: any) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => handleTierChange(t.id)}
                                        className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${tier === t.id
                                            ? 'border-emerald-500 bg-emerald-500/5 shadow-lg'
                                            : 'border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800'
                                            }`}
                                    >
                                        <div className={`h-1.5 w-8 rounded-full mb-3 ${t.color}`} />
                                        <div className="font-black text-sm">{t.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
                                        {tier === t.id && (
                                            <div className="absolute top-4 right-4 text-emerald-500 uppercase text-[10px] font-black flex items-center gap-1">
                                                Active <CheckCircle2 className="h-3 w-3" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Modules Grid */}
                    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest">Functional Domain Modules</h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Granular Control Enabled</span>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                            {DOMAINS.map((domain: any) => {
                                const Icon = domain.icon;
                                return (
                                    <div key={domain.id} className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-900">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Icon className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">{domain.name}</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {domain.modules.map((mod: any) => (
                                                <label key={mod.id} className="flex items-start gap-3 group cursor-pointer">
                                                    <div className="relative flex items-center pt-1">
                                                        <input
                                                            type="checkbox"
                                                            name={`module_${mod.id}`}
                                                            checked={selectedModules.includes(mod.id)}
                                                            onChange={() => toggleModule(mod.id)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedModules.includes(mod.id)
                                                            ? 'border-emerald-500 bg-emerald-500'
                                                            : 'border-gray-200 dark:border-gray-800 group-hover:border-emerald-400'
                                                            }`}>
                                                            {selectedModules.includes(mod.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-bold transition-colors ${selectedModules.includes(mod.id) ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{mod.name}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-tight">{mod.description}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Additional Details (Folded) */}
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 shadow-sm space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-900 pb-4 mb-6">Physical & Contact Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="contactEmail" className="text-[10px] font-black uppercase text-gray-500">Contact Email</label>
                                <input type="email" id="contactEmail" name="contactEmail" required className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="taxId" className="text-[10px] font-black uppercase text-gray-500">Hospital Tax PIN / KRA PIN</label>
                                <input type="text" id="taxId" name="taxId" required className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500 transition-all uppercase" placeholder="e.g. PIN-A12345678" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-[10px] font-black uppercase text-gray-500">Phone Number</label>
                                <input type="tel" id="phone" name="phone" required className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="detailedAddress" className="text-[10px] font-black uppercase text-gray-500">Physical Address</label>
                            <textarea id="detailedAddress" name="detailedAddress" required rows={2} className="w-full rounded-xl border border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"></textarea>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {!showPayment ? (
                            <button
                                type="button"
                                onClick={() => setShowPayment(true)}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                <Globe className="h-5 w-5" />
                                Proceed to Payment & Provisioning
                            </button>
                        ) : (
                            <div className="space-y-6 theme-dark bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-black text-white">Payment Required</h3>
                                    <p className="text-sm text-gray-400">Please settle the setup fee for the <span className="text-emerald-500 font-bold">{tier}</span> tier.</p>
                                </div>
                                
                                <PayPalCheckoutButton 
                                    financialRecordId="new-tenant-setup"
                                    tenantId="system"
                                    amountToPay={tier === 'CLINIC' ? '100.00' : tier === 'GENERAL' ? '250.00' : '500.00'}
                                    onSuccess={() => setIsPaid(true)}
                                />

                                {isPaid && (
                                    <button
                                        type="submit"
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 animate-bounce"
                                    >
                                        <Save className="h-5 w-5" />
                                        Complete Provisioning
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
