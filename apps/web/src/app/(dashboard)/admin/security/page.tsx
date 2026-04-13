'use client';

import React from 'react';
import { trpc } from '@/trpc/client';
import { Shield, Lock, History, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

/**
 * SAs Admin Security & Compliance Panel
 */
export default function SecurityPage() {
  const { data: auditData, isLoading: isLoadingLogs } = trpc.audit.getLogs.useQuery({ limit: 20 });
  const { data: integrityData } = trpc.audit.verifyIntegrity.useQuery();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header section with Glassmorphism */}
      <div className="mb-10 p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/50 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Shield size={120} className="text-blue-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Lock className="text-blue-400" size={24} />
            </div>
            <span className="text-blue-400 font-semibold tracking-wider text-sm uppercase">Compliance Command Center</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Security & Governance</h1>
          <p className="text-slate-400 max-w-2xl">
            Monitor system-wide clinical operations, verify the cryptographic integrity of audit trails, and manage the Amisi Sovereign KMS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Integrity Card */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-4 bg-emerald-500/10 rounded-full">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Chain Integrity</h3>
          <p className="text-sm text-slate-400 mt-1">Audit hash chain verified</p>
          <div className="mt-4 px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium uppercase tracking-widest">
            {integrityData?.status || 'VERIFYING...'}
          </div>
        </div>

        {/* KMS Status Card */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-4 bg-blue-500/10 rounded-full">
            <Shield size={40} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Sovereign KMS</h3>
          <p className="text-sm text-slate-400 mt-1">AES-256-GCM Envelope Active</p>
          <div className="mt-4 px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium uppercase tracking-widest">
            ACTIVE (SAs CONTROL)
          </div>
        </div>

        {/* HIPAA Status Card */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-4 bg-amber-500/10 rounded-full">
            <AlertCircle size={40} className="text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Compliance Status</h3>
          <p className="text-sm text-slate-400 mt-1">Operational Audit Logging</p>
          <div className="mt-4 px-4 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium uppercase tracking-widest">
            ENFORCED
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-950/50 rounded-[2rem] border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="text-slate-400" size={20} />
            <h2 className="text-lg font-bold text-white">Recent Security Events</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actor</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Resource</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Security Hash</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingLogs ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 animate-pulse">
                    Retrieving immutable logs...
                  </td>
                </tr>
              ) : (auditData?.logs as any[])?.map((log: any) => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-900/20 transition-colors group">
                  <td className="px-8 py-5 text-sm text-slate-300">
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{log.actorName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.actorRole}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${
                      log.action === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                      log.action === 'ACCESS' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400">
                    {log.resource} <span className="text-slate-600 text-[10px] ml-1">#{log.resourceId?.slice(0,8)}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                        {log.hash?.slice(0, 16)}...
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
