'use client';

import { useState } from 'react';
import { Building2, Save, Trash2, Globe, Shield, Database, LayoutGrid, AlertTriangle, Copy, Power, PowerOff, Loader2 } from 'lucide-react';
import { updateTenantFull, updateTenantStatus, deleteTenant, cloneTenant } from '@/app/actions/core-actions';
import { useRouter } from 'next/navigation';

interface HospitalEditFormProps {
    tenant: any;
}

const MODULES = [
    { id: 'pmi', name: 'Patient Management (PMI)' },
    { id: 'opd', name: 'Outpatient (OPD)' },
    { id: 'pharmacy', name: 'Pharmacy' },
    { id: 'rcm', name: 'Revenue Cycle (RCM)' },
    { id: 'ipd', name: 'Inpatient (IPD)' },
    { id: 'lis', name: 'Laboratory (LIS)' },
    { id: 'ris', name: 'Radiology (RIS)' },
    { id: 'inventory', name: 'Inventory & SCM' },
    { id: 'ot', name: 'Operation Theater' },
    { id: 'icu', name: 'ICU Management' },
    { id: 'ctms', name: 'Clinical Trials' },
    { id: 'irb', name: 'Ethics Committee (IRB)' },
];

export function HospitalEditForm({ tenant }: HospitalEditFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [dbLocked, setDbLocked] = useState(true);

    const [formData, setFormData] = useState({
        name: tenant.name,
        region: tenant.region,
        dbUrl: tenant.dbUrl,
        tier: tenant.tier,
        contactEmail: tenant.contactEmail || '',
        phone: tenant.phone || '',
        detailedAddress: tenant.detailedAddress || '',
        taxId: tenant.taxId || '',
        logoUrl: tenant.logoUrl || '',
        marketingSlogan: tenant.marketingSlogan || '',
        primaryColor: tenant.primaryColor || '#2563EB',
        secondaryColor: tenant.secondaryColor || '#0F172A',
        enabledModules: tenant.enabledModules || {},
    });

    const handleModuleToggle = (moduleId: string) => {
        setFormData(prev => ({
            ...prev,
            enabledModules: {
                ...prev.enabledModules,
                [moduleId]: !prev.enabledModules[moduleId]
            }
        }));
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const res = await fetch('/api/system/upload', {
                method: 'POST',
                body: formDataUpload
            });
            const data = await res.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, logoUrl: data.url }));
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateTenantFull(tenant.id, formData);
            router.refresh();
        } catch (err) {
            alert('Failed to update hospital configuration.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusToggle = async () => {
        const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
        if (confirm(`Are you sure you want to ${newStatus} this hospital?`)) {
            await updateTenantStatus(tenant.id, newStatus);
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (confirm('CRITICAL: This will permanently delete this hospital node. This action cannot be undone. Proceed?')) {
            setIsDeleting(true);
            await deleteTenant(tenant.id);
            router.push('/system/dashboard');
        }
    };

    const handleClone = async () => {
        const name = prompt('Enter name for the new cloned hospital:');
        if (!name) return;
        const slug = prompt('Enter slug (e.g., hospital-b):');
        if (!slug) return;
        const dbUrl = prompt('Enter Database URL for the new node:');
        if (!dbUrl) return;

        setIsSaving(true);
        try {
            await cloneTenant(tenant.id, { 
                name, 
                slug, 
                region: formData.region, 
                dbUrl,
                adminName: 'Admin User',
                adminEmail: `admin@${slug}.com`,
                adminPassword: 'Amisi@2026!'
            });
            alert('Clone provisioned successfully.');
            router.push('/system/dashboard');
        } catch (err) {
            alert('Cloning failed. Ensure slug is unique.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Branding Section */}
            <section className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Identity & Branding</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Hospital Name</label>
                        <input 
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Marketing Slogan</label>
                        <input 
                            value={formData.marketingSlogan}
                            onChange={e => setFormData({ ...formData, marketingSlogan: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Detailed Address</label>
                        <input 
                            value={formData.detailedAddress}
                            onChange={e => setFormData({ ...formData, detailedAddress: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Tax / KRA PIN</label>
                        <input 
                            value={formData.taxId}
                            onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    
                    {/* Logo & Colors */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Hospital Logo</label>
                        <div className="flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={() => document.getElementById('logo-upload-edit')?.click()}
                                className="flex-1 bg-white/5 hover:bg-white/10 border-dashed border-white/20 h-16 rounded-2xl flex items-center justify-center gap-2 text-neutral-400 text-xs font-bold uppercase"
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isUploading ? 'Uploading...' : 'Upload Logo'}
                            </button>
                            <input id="logo-upload-edit" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            {formData.logoUrl && (
                                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 p-2 overflow-hidden flex items-center justify-center">
                                    <img src={formData.logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Primary Color</label>
                            <div className="flex gap-2">
                                <input 
                                    type="color" 
                                    value={formData.primaryColor}
                                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="h-12 w-12 p-1 bg-white/5 border border-white/10 rounded-xl cursor-pointer"
                                />
                                <input 
                                    value={formData.primaryColor}
                                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-mono uppercase text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Secondary Color</label>
                            <div className="flex gap-2">
                                <input 
                                    type="color" 
                                    value={formData.secondaryColor}
                                    onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                                    className="h-12 w-12 p-1 bg-white/5 border border-white/10 rounded-xl cursor-pointer"
                                />
                                <input 
                                    value={formData.secondaryColor}
                                    onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-mono uppercase text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Infrastructure & Usage Section */}
            <section className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Database className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Infrastructure & Usage</h2>
                    </div>
                    <button 
                        type="button"
                        onClick={() => window.open(`/${tenant.slug}`, '_blank')}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                    >
                        <Globe className="w-4 h-4" />
                        Impersonate Tenant
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Plan</p>
                        <p className="text-xl text-white font-black italic">{tenant.subscriptions?.[0]?.plan?.name || 'No Active Plan'}</p>
                        <p className="text-xs text-gray-400 mt-1">Tier: {formData.tier}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Storage Used</p>
                        <p className="text-xl text-white font-black italic">{tenant.usages?.[0]?.storageUsedMb || 0} MB</p>
                        <p className="text-xs text-gray-400 mt-1">Data allocated locally</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">API Calls (24h)</p>
                        <p className="text-xl text-white font-black italic">{tenant.usages?.[0]?.apiCallsCount || 0}</p>
                        <p className="text-xs text-gray-400 mt-1">Network traffic</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-end pr-1">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Isolated Database URL</label>
                            <button 
                                onClick={() => setDbLocked(!dbLocked)}
                                className="text-[10px] font-bold text-amber-500/80 hover:text-amber-500 flex items-center gap-1 transition-colors uppercase tracking-widest"
                            >
                                {dbLocked ? <Shield className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                {dbLocked ? 'Unlock for Edit' : 'Lock Field'}
                            </button>
                        </div>
                        <input 
                            disabled={dbLocked}
                            value={formData.dbUrl}
                            onChange={e => setFormData({ ...formData, dbUrl: e.target.value })}
                            className={`w-full border rounded-2xl p-4 transition-all font-mono text-xs ${dbLocked ? 'bg-neutral-800/20 border-white/5 text-neutral-600 cursor-not-allowed' : 'bg-white/5 border-amber-500/30 text-white shadow-lg shadow-amber-500/5'}`}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Deployment Region</label>
                            <input 
                                value={formData.region}
                                onChange={e => setFormData({ ...formData, region: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Deployment Tier</label>
                            <select 
                                value={formData.tier}
                                onChange={e => setFormData({ ...formData, tier: e.target.value as any })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium appearance-none"
                            >
                                <option value="CLINIC">CLINIC (Basic)</option>
                                <option value="GENERAL">GENERAL (Enterprise)</option>
                                <option value="RESEARCH">RESEARCH (Full Suite)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modules Section */}
            <section className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <LayoutGrid className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Active Entitlements</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MODULES.map((mod: any) => (
                        <button
                            key={mod.id}
                            onClick={() => handleModuleToggle(mod.id)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.enabledModules[mod.id] ? 'bg-emerald-500/5 border-emerald-500 /30 text-white' : 'bg-white/5 border-white/5 text-neutral-500 hover:border-white/10 hover:bg-white/[0.07]'}`}
                        >
                            <span className="text-xs font-bold uppercase tracking-tight">{mod.name}</span>
                            <div className={`h-2 w-2 rounded-full ${formData.enabledModules[mod.id] ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-800'}`} />
                        </button>
                    ))}
                </div>
            </section>

            {/* Actions Section */}
            <div className="flex items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? 'Synchronizing...' : <Save className="h-5 w-5" />}
                        <span>Update Orchestration</span>
                    </button>
                    <button 
                         onClick={handleClone}
                        className="flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl active:scale-95"
                    >
                        <Copy className="h-5 w-5" />
                        <span>Clone Hospital</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleStatusToggle}
                        className={`p-4 rounded-2xl border transition-all font-bold text-xs uppercase tracking-widest ${tenant.status === 'active' ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/5' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5'}`}
                    >
                        <div className="flex items-center gap-2">
                             {tenant.status === 'active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                             {tenant.status === 'active' ? 'Suspend Node' : 'Activate Node'}
                        </div>
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-4 rounded-2xl bg-rose-600/10 border border-rose-600/20 text-rose-500 hover:bg-rose-600/20 transition-all group"
                    >
                        <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
