'use client';

import React from 'react';
import { api } from '@/trpc/client';
import { 
  Activity, 
  Database, 
  Server, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw 
} from 'lucide-react';

export default function SyncHealthPage() {
  const { data: sync, isLoading, refetch } = api.sync.getSyncStatus.useQuery(undefined, {
    refetchInterval: 10000 // Refresh every 10s
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="animate-spin text-blue-500 mr-2" />
        <span className="text-slate-400">Loading cluster health...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">Sync <span className="text-blue-500">Pulse</span></h1>
          <p className="text-slate-400">Real-time cluster connectivity and queue monitoring</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Server size={24} />
            </div>
            {sync?.queue.unsyncedCount === 0 ? (
              <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold uppercase py-1 px-2 bg-emerald-500/10 rounded-full">
                <CheckCircle2 size={12} /> Synced
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-500 text-xs font-bold uppercase py-1 px-2 bg-amber-500/10 rounded-full">
                <Activity size={12} className="animate-pulse" /> Pending
              </span>
            )}
          </div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Sync Queue</h3>
          <p className="text-3xl font-bold text-white mt-1">{sync?.queue.unsyncedCount.toLocaleString()}</p>
          <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: sync?.queue.unsyncedCount === 0 ? '100%' : '30%' }}
            />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Database size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Nodes</h3>
          <p className="text-3xl font-bold text-white mt-1">{sync?.nodes.length || 0}</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Activity size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Network Mode</h3>
          <p className="text-2xl font-bold text-white mt-1">Hybrid Cloud/Edge</p>
        </div>
      </div>

      {/* Cluster Details */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Cluster Heartbeat</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/20">
                <th className="p-4 text-slate-400 font-medium text-sm">Node Name</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Type</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Version</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Last Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sync?.nodes.map((node) => (
                <tr key={node.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="p-4 font-semibold text-white">{node.name}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-2 text-slate-300">
                      {node.type === 'EDGE' ? <Server size={14} /> : <Smartphone size={14} />}
                      {node.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${node.isHealthy ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                       <span className={node.isHealthy ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {node.isHealthy ? 'Healthy' : 'Sync Error'}
                       </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 family-mono text-xs">{node.version}</td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(node.lastHeartbeat).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {sync?.nodes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="text-slate-700" size={48} />
                      <p className="text-slate-500">No active sync nodes detected in the cluster.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
