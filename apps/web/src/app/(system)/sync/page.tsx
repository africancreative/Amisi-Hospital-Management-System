'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  Activity,
} from 'lucide-react';

interface SyncJob {
  id: string;
  tenantName: string;
  tenantSlug: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'IN_PROGRESS';
  direction: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
  recordsSynced: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

interface SyncQueue {
  tenantSlug: string;
  tenantName: string;
  pendingCount: number;
  oldestItem: Date;
  status: 'healthy' | 'delayed' | 'failed';
}

// Mock data
const SYNC_JOBS: SyncJob[] = [
  {
    id: '1',
    tenantName: 'City General Hospital',
    tenantSlug: 'city-general',
    status: 'COMPLETED',
    direction: 'BIDIRECTIONAL',
    recordsSynced: 1247,
    startedAt: new Date('2026-05-04T10:00:00'),
    completedAt: new Date('2026-05-04T10:05:00'),
  },
  {
    id: '2',
    tenantName: 'Sunset Family Clinic',
    tenantSlug: 'sunset-clinic',
    status: 'IN_PROGRESS',
    direction: 'PUSH',
    recordsSynced: 342,
    startedAt: new Date('2026-05-04T10:25:00'),
  },
  {
    id: '3',
    tenantName: 'Metro Lab Services',
    tenantSlug: 'metro-lab',
    status: 'FAILED',
    direction: 'PULL',
    recordsSynced: 89,
    errorMessage: 'Connection timeout after 30s',
    startedAt: new Date('2026-05-04T09:45:00'),
  },
];

const SYNC_QUEUES: SyncQueue[] = [
  { tenantSlug: 'city-general', tenantName: 'City General Hospital', pendingCount: 12, oldestItem: new Date('2026-05-04T08:00:00'), status: 'healthy' },
  { tenantSlug: 'sunset-clinic', tenantName: 'Sunset Family Clinic', pendingCount: 45, oldestItem: new Date('2026-05-04T06:00:00'), status: 'delayed' },
  { tenantSlug: 'metro-lab', tenantName: 'Metro Lab Services', pendingCount: 234, oldestItem: new Date('2026-05-03T14:00:00'), status: 'failed' },
];

export default function SyncPage() {
  const [activeTab, setActiveTab] = useState<'queues' | 'jobs' | 'failed'>('queues');
  const [search, setSearch] = useState('');

  const failedJobs = SYNC_JOBS.filter(j => j.status === 'FAILED');
  const healthyQueues = SYNC_QUEUES.filter(q => q.status === 'healthy').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">Sync Monitoring</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track local ↔ cloud synchronization</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg">
            <Download className="w-4 h-4" />
            Export Logs
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
            <RefreshCw className="w-4 h-4" />
            Retry All Failed
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Healthy Queues" value={`${healthyQueues}/${SYNC_QUEUES.length}`} status="healthy" icon={<CheckCircle className="w-4 h-4" />} />
        <StatCard title="Pending Jobs" value={SYNC_JOBS.filter(j => j.status === 'PENDING' || j.status === 'IN_PROGRESS').length.toString()} status="warning" icon={<Clock className="w-4 h-4" />} />
        <StatCard title="Failed Today" value={failedJobs.length.toString()} status="error" icon={<XCircle className="w-4 h-4" />} />
        <StatCard title="Records Synced" value="12,450" status="healthy" icon={<Activity className="w-4 h-4" />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {(['queues', 'jobs', 'failed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'failed' && failedJobs.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-900/30 text-red-400 rounded-full text-xs">
                {failedJobs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by tenant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Queues Tab */}
      {activeTab === 'queues' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs px-4 py-3">Tenant</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Status</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Pending</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Oldest Item</th>
                <th className="text-right text-gray-500 text-xs px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {SYNC_QUEUES.filter(q => q.tenantName.toLowerCase().includes(search.toLowerCase())).map(queue => (
                <tr key={queue.tenantSlug} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">{queue.tenantName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <QueueStatusBadge status={queue.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${queue.pendingCount > 100 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {queue.pendingCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">
                      {Math.floor((Date.now() - queue.oldestItem.getTime()) / 60000)} min ago
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded">
                        <Activity className="w-4 h-4" />
                      </button>
                      {queue.status === 'failed' && (
                        <button className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-gray-800 rounded">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs px-4 py-3">Tenant</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Status</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Direction</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Records</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {SYNC_JOBS.filter(j => j.tenantName.toLowerCase().includes(search.toLowerCase())).map(job => (
                <tr key={job.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">{job.tenantName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">{job.direction}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{job.recordsSynced}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">
                      {job.completedAt
                        ? `${Math.floor((job.completedAt.getTime() - job.startedAt.getTime()) / 1000)}s`
                        : 'In progress...'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Failed Tab */}
      {activeTab === 'failed' && (
        <div className="space-y-3">
          {failedJobs.map(job => (
            <div key={job.id} className="bg-red-900/10 border border-red-800/50 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-gray-300 text-sm font-medium">{job.tenantName}</p>
                    <p className="text-red-300 text-xs mt-1">{job.errorMessage}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {job.recordsSynced} records synced before failure
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg">
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 text-gray-400 hover:text-gray-200 text-xs rounded-lg">
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, status, icon }: {
  title: string;
  value: string;
  status: 'healthy' | 'warning' | 'error';
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs">{title}</p>
          <p className="text-gray-100 text-xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`${
          status === 'healthy' ? 'text-green-400' :
          status === 'warning' ? 'text-yellow-400' : 'text-red-400'
        }`}>{icon}</div>
      </div>
    </div>
  );
}

function QueueStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      status === 'healthy' ? 'bg-green-900/30 text-green-400' :
      status === 'delayed' ? 'bg-yellow-900/30 text-yellow-400' :
      'bg-red-900/30 text-red-400'
    }`}>
      {status === 'healthy' && <CheckCircle className="w-3 h-3" />}
      {status === 'delayed' && <Clock className="w-3 h-3" />}
      {status === 'failed' && <XCircle className="w-3 h-3" />}
      {status}
    </span>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' :
      status === 'FAILED' ? 'bg-red-900/30 text-red-400' :
      status === 'IN_PROGRESS' ? 'bg-blue-900/30 text-blue-400' :
      'bg-gray-800 text-gray-400'
    }`}>
      {status.replace('_', ' ')}
    </span>
  );
}
