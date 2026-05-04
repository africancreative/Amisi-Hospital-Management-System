'use client';

import { useState, useTransition } from 'react';
import { Key, Plus, Copy, Trash2, CheckCircle2, Eye, EyeOff, Loader2, Building2 } from 'lucide-react';
import { generateApiKey, revokeApiKey } from '@/app/actions/system-actions';

interface ApiKey {
    key: string;
    label: string;
    createdAt: string;
}

interface Tenant {
    id: string;
    name: string;
    slug: string;
    tier: string;
}

interface ApiKeyManagerProps {
    tenants: Tenant[];
    allKeys: Record<string, ApiKey[]>;
}

export function ApiKeyManager({ tenants, allKeys: initialKeys }: ApiKeyManagerProps) {
    const [allKeys, setAllKeys] = useState(initialKeys);
    const [isPending, startTransition] = useTransition();
    const [selectedTenant, setSelectedTenant] = useState<string>(tenants[0]?.id || '');
    const [newLabel, setNewLabel] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [newKeyResult, setNewKeyResult] = useState<{ key: string; label: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const currentTenantKeys: ApiKey[] = allKeys[selectedTenant] || [];
    const currentTenant = tenants.find((t: any) => t.id === selectedTenant);

    const handleGenerate = () => {
        if (!selectedTenant || !newLabel.trim()) {
            setError('Select a hospital and enter a key label.');
            return;
        }
        setError(null);
        startTransition(async () => {
            try {
                const result = await generateApiKey(selectedTenant, newLabel.trim());
                setNewKeyResult(result);
                setAllKeys(prev => ({
                    ...prev,
                    [selectedTenant]: [
                        { key: result.key, label: result.label, createdAt: new Date().toISOString() },
                        ...(prev[selectedTenant] || [])
                    ]
                }));
                setNewLabel('');
            } catch (e: any) {
                setError(e.message);
            }
        });
    };

    const handleRevoke = (key: string) => {
        startTransition(async () => {
            await revokeApiKey(selectedTenant, key);
            setAllKeys(prev => ({
                ...prev,
                [selectedTenant]: (prev[selectedTenant] || []).filter((k: any) => k.key !== key)
            }));
            if (newKeyResult?.key === key) setNewKeyResult(null);
        });
    };

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
    };

    const toggleVisibility = (key: string) => {
        setVisibleKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const maskKey = (key: string) => {
        const parts = key.split('_');
        if (parts.length < 3) return '••••••••••••••••••••';
        return `${parts[0]}_${parts[1]}_${'•'.repeat(20)}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="rounded-[2.5rem] border border-white/5 bg-neutral-900/40 p-10 backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Key className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">API Key Manager</h2>
                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Generate & manage access keys per hospital cluster</p>
                    </div>
                </div>

                {/* Generate Form */}
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Hospital Selector */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Hospital Cluster</p>
                        <select
                            value={selectedTenant}
                            onChange={e => { setSelectedTenant(e.target.value); setNewKeyResult(null); }}
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 font-bold"
                        >
                            {tenants.map((t: any) => (
                                <option key={t.id} value={t.id} className="bg-neutral-900">{t.name} ({t.slug})</option>
                            ))}
                        </select>
                    </div>

                    {/* Label */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Key Label / Purpose</p>
                        <input
                            value={newLabel}
                            onChange={e => setNewLabel(e.target.value)}
                            placeholder="e.g. Mobile App Production"
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 font-bold"
                        />
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleGenerate}
                            disabled={isPending}
                            className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Generate Key
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-xs font-black text-red-400 uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {/* Newly generated key — show once */}
                {newKeyResult && (
                    <div className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Key Generated — Copy Now. It won't be shown again in full.</p>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-sm">
                            <span className="flex-1 text-emerald-300 break-all">{newKeyResult.key}</span>
                            <button
                                onClick={() => handleCopy(newKeyResult.key)}
                                className="shrink-0 h-8 w-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center text-emerald-400 transition-all"
                            >
                                {copiedKey === newKeyResult.key ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Key List per selected Tenant */}
            <div className="rounded-[2.5rem] border border-white/5 bg-neutral-900/40 p-10 backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-amber-500 rounded-full" />
                        <div>
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">
                                {currentTenant?.name || 'Select a Cluster'}
                            </h3>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                                {currentTenantKeys.length} Active Key{currentTenantKeys.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    {currentTenant && (
                        <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg uppercase tracking-widest">
                            {currentTenant.tier}
                        </span>
                    )}
                </div>

                {currentTenantKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-700 mb-4">
                            <Key className="h-8 w-8" />
                        </div>
                        <p className="text-neutral-600 font-black uppercase tracking-widest text-xs">No API Keys Generated</p>
                        <p className="text-neutral-700 text-xs mt-1">Use the form above to generate the first key for this cluster.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentTenantKeys.map((k: ApiKey) => {
                            const isVisible = visibleKeys.has(k.key);
                            return (
                                <div key={k.key} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-amber-500/20 transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <Key className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-white uppercase tracking-wider mb-1">{k.label}</p>
                                        <p className="font-mono text-xs text-neutral-500 truncate">
                                            {isVisible ? k.key : maskKey(k.key)}
                                        </p>
                                        <p className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest mt-1">
                                            Created {new Date(k.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleVisibility(k.key)}
                                            className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-white transition-all"
                                            title={isVisible ? 'Hide key' : 'Show key'}
                                        >
                                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleCopy(k.key)}
                                            className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-white transition-all"
                                            title="Copy key"
                                        >
                                            {copiedKey === k.key ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleRevoke(k.key)}
                                            disabled={isPending}
                                            className="h-9 w-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-all disabled:opacity-50"
                                            title="Revoke key"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Summary across all tenants */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tenants.map((t: any) => {
                    const count = (allKeys[t.id] || []).length;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTenant(t.id)}
                            className={`p-5 rounded-2xl border text-left transition-all hover:border-amber-500/30 ${selectedTenant === t.id ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5 bg-white/[0.02]'}`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 className="h-4 w-4 text-neutral-500" />
                                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{t.tier}</span>
                            </div>
                            <p className="font-black text-white text-sm truncate">{t.name}</p>
                            <p className="text-3xl font-black text-amber-400 mt-2">{count}</p>
                            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">API Key{count !== 1 ? 's' : ''}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
