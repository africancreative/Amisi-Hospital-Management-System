'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
    Users, 
    Search,
    Filter,
    Loader2,
    X,
    Plus,
    Trash2
} from 'lucide-react';

const STAGES = ['NewLead', 'Qualified', 'ProposalSent', 'Negotiation', 'Won', 'Lost'];
const SOURCES = ['Website', 'WhatsApp', 'Email', 'SalesAgent'];
const FACILITY_TYPES = ['CLINIC', 'HOSPITAL', 'PHARMACY', 'LAB', 'SPECIALIST'];

interface Lead {
    id: string;
    hospitalName: string;
    contactName: string;
    contactEmail: string;
    facilityType: string;
    status: string;
    potentialValue: number | null;
    source: string;
}

export function CRMLeadsView() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (status) params.set('status', status);
            const res = await fetch(`/api/crm/leads?${params.toString()}`);
            const data = await res.json();
            setLeads(Array.isArray(data) ? data : []);
        } catch {
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => {
        const t = setTimeout(fetchLeads, search ? 300 : 0);
        return () => clearTimeout(t);
    }, [fetchLeads, search]);

    useEffect(() => {
        fetchLeads();
    }, [status, fetchLeads]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'NewLead': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'Qualified': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            'ProposalSent': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'Negotiation': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'Lost': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
        return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this lead? This cannot be undone.')) return;
        await fetch(`/api/crm/leads/${id}`, { method: 'DELETE' });
        fetchLeads();
    };

    const handleCreate = async (form: any) => {
        setSaving(true);
        try {
            const res = await fetch('/api/crm/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _admin: true, ...form }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create lead');
            setShowForm(false);
            fetchLeads();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
            <div className="flex items-center justify-between pb-8 border-b border-gray-800 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-500" />
                        Leads & Pipeline
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Manage potential hospital clients and track deal progress.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            placeholder="Search leads..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                        >
                            <option value="">All Stages</option>
                            {STAGES.map(s => <option key={s} value={s}>{s.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Lead
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50">
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Hospital Name</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Contact</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Pipeline Stage</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Potential Value</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Source</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Loading Leads Data...</span>
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                        No leads found in pipeline.
                                    </td>
                                </tr>
                            ) : leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors group">
                                    <td className="p-4">
                                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{lead.hospitalName}</p>
                                        <p className="text-xs text-gray-500 mt-1">{lead.facilityType}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-gray-300">{lead.contactName}</p>
                                        <p className="text-xs text-gray-500 mt-1">{lead.contactEmail}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(lead.status)}`}>
                                            {lead.status.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-sm text-gray-300">
                                        {lead.potentialValue ? `$${Number(lead.potentialValue).toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium">
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(lead.id)}
                                            className="p-2 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                                            title="Delete lead"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <LeadForm onCancel={() => setShowForm(false)} onSave={handleCreate} saving={saving} />
            )}
        </div>
    );
}

function LeadForm({ onCancel, onSave, saving }: { onCancel: () => void; onSave: (form: any) => void; saving: boolean }) {
    const [form, setForm] = useState({
        hospitalName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        facilityType: 'CLINIC',
        source: 'Website',
        status: 'NewLead',
        potentialValue: '',
        message: '',
    });

    const set = (key: string) => (e: any) => setForm({ ...form, [key]: e.target.value });

    const submit = () => {
        if (!form.hospitalName || !form.contactName) {
            alert('Hospital name and contact name are required.');
            return;
        }
        onSave({
            ...form,
            potentialValue: form.potentialValue ? Number(form.potentialValue) : undefined,
            _admin: true,
        });
    };

    const inputCls = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50";
    const labelCls = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white uppercase italic">New Lead</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-5">
                    <div>
                        <label className={labelCls}>Hospital Name *</label>
                        <input className={inputCls} value={form.hospitalName} onChange={set('hospitalName')} placeholder="City Central Hospital" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Contact Name *</label>
                            <input className={inputCls} value={form.contactName} onChange={set('contactName')} placeholder="Dr. Jane Smith" />
                        </div>
                        <div>
                            <label className={labelCls}>Contact Email</label>
                            <input className={inputCls} value={form.contactEmail} onChange={set('contactEmail')} placeholder="jane@hospital.com" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Facility Type</label>
                            <select className={inputCls} value={form.facilityType} onChange={set('facilityType')}>
                                {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Source</label>
                            <select className={inputCls} value={form.source} onChange={set('source')}>
                                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Pipeline Stage</label>
                            <select className={inputCls} value={form.status} onChange={set('status')}>
                                {STAGES.map(s => <option key={s} value={s}>{s.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Potential Value ($)</label>
                            <input className={inputCls} value={form.potentialValue} onChange={set('potentialValue')} type="number" placeholder="250000" />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Notes</label>
                        <textarea className={`${inputCls} resize-none`} rows={3} value={form.message} onChange={set('message')} placeholder="Lead context, requirements, next steps..." />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-all">
                        Cancel
                    </button>
                    <button onClick={submit} disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Lead
                    </button>
                </div>
            </div>
        </div>
    );
}
