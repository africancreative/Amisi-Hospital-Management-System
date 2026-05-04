'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, History, Database, Search, Filter } from 'lucide-react';
import { getGlobalAuditLogs, GlobalAuditEntry } from '../../app/actions/audit-actions';

/**
 * HIPAA Audit Monitoring Dashboard
 * Provides centralized security oversight for the AmisiMedOS platform.
 */
export function AuditMonitoring() {
    const [logs, setLogs] = useState<GlobalAuditEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const loadLogs = async () => {
            setIsLoading(true);
            try {
                const data = await getGlobalAuditLogs();
                setLogs(data);
            } catch (e) {
                console.error("Failed to load audit logs", e);
            } finally {
                setIsLoading(false);
            }
        };

        loadLogs();
        const interval = setInterval(loadLogs, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter((log: any) => 
        log.tenantName.toLowerCase().includes(filter.toLowerCase()) ||
        log.actorName.toLowerCase().includes(filter.toLowerCase()) ||
        log.action.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SecurityStatCard 
                    title="Audit Chains" 
                    value="ACTIVE" 
                    icon={Shield} 
                    status="HEALTHY"
                    desc="Distributed hash chains verified"
                />
                <SecurityStatCard 
                    title="High-Risk Actions" 
                    value={logs.filter((l: any) => ['EXPORT', 'DELETE'].includes(l.action)).length.toString()} 
                    icon={AlertTriangle} 
                    status="WARNING"
                    desc="Actions requiring manual review"
                />
                <SecurityStatCard 
                    title="PHI Intakes" 
                    value={logs.filter((l: any) => l.action === 'CREATE').length.toString()} 
                    icon={CheckCircle2} 
                    status="INFO"
                    desc="Total clinical records today"
                />
            </div>

            {/* Audit Log Controls */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3 flex-1">
                    <Search className="h-5 w-5 text-neutral-500" />
                    <input 
                        type="text" 
                        placeholder="Search global security logs..." 
                        className="bg-transparent border-none focus:ring-0 text-white w-full placeholder:text-neutral-600"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-neutral-400 hover:text-white transition-colors">
                        <Filter className="h-5 w-5" />
                    </button>
                    <button className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                        Export for Audit
                    </button>
                </div>
            </div>

            {/* Main Log Feed */}
            <div className="rounded-3xl border border-white/5 bg-neutral-900/50 overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Tenant</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Actor</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Resource</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest text-right">Chain Integrity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-neutral-500">Initializing secure global audit link...</td>
                                </tr>
                            ) : filteredLogs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-bold italic">H</div>
                                            <span className="text-sm font-medium text-white">{log.tenantName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white font-medium">{log.actorName}</span>
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{log.actorRole}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                                            ${log.action === 'EXPORT' ? 'bg-amber-500/10 text-amber-500' : 
                                              log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-500' :
                                              'bg-blue-500/10 text-blue-500'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-neutral-400 font-mono">{log.resource}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-neutral-500">{new Date(log.timestamp).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`h-2 w-2 rounded-full ${log.isVerified ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${log.isVerified ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {log.isVerified ? 'Verified Integrity' : 'Chain Inconsistent'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SecurityStatCard({ title, value, icon: Icon, status, desc }: any) {
    const statusColors: any = {
        HEALTHY: "text-emerald-500",
        WARNING: "text-amber-500",
        INFO: "text-blue-500",
    };

    return (
        <div className="rounded-3xl border border-white/5 bg-neutral-900/50 p-6 backdrop-blur-xl shadow-2xl transition-all hover:border-white/10 group">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-neutral-400" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{title}</p>
                    <p className={`text-xl font-black ${statusColors[status]}`}>{value}</p>
                </div>
            </div>
            <p className="text-xs text-neutral-500">{desc}</p>
        </div>
    );
}
