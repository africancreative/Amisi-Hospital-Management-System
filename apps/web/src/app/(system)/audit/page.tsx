'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actor: string;
  actorRole: string;
  actorName: string;
  tenant: string;
  action: string;
  resource: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: new Date('2026-05-04T10:30:00'),
    actor: 'super_admin',
    actorRole: 'SUPER_ADMIN',
    actorName: 'John Admin',
    tenant: 'city-general',
    action: 'TENANT_SUSPEND',
    resource: 'Tenant',
    oldValue: 'active',
    newValue: 'suspended',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    timestamp: new Date('2026-05-04T09:15:00'),
    actor: 'ops_admin',
    actorRole: 'OPERATIONS_ADMIN',
    actorName: 'Sarah Operations',
    tenant: 'sunset-clinic',
    action: 'MODULE_TOGGLE',
    resource: 'Module',
    oldValue: 'disabled',
    newValue: 'enabled',
    ipAddress: '10.0.0.45',
  },
  {
    id: '3',
    timestamp: new Date('2026-05-03T16:45:00'),
    actor: 'finance_admin',
    actorRole: 'FINANCE_ADMIN',
    actorName: 'Mike Finance',
    tenant: 'metro-lab',
    action: 'PAYMENT_REFUND',
    resource: 'Billing',
    oldValue: '$1499',
    newValue: '$0',
    ipAddress: '172.16.0.10',
  },
  {
    id: '4',
    timestamp: new Date('2026-05-03T14:20:00'),
    actor: 'super_admin',
    actorRole: 'SUPER_ADMIN',
    actorName: 'John Admin',
    tenant: 'system',
    action: 'CONFIG_UPDATE',
    resource: 'GlobalSettings',
    oldValue: 'sandbox',
    newValue: 'production',
    ipAddress: '192.168.1.100',
  },
  {
    id: '5',
    timestamp: new Date('2026-05-02T11:00:00'),
    actor: 'support_eng',
    actorRole: 'SUPPORT_ENGINEER',
    actorName: 'Lisa Support',
    tenant: 'downtown-pharmacy',
    action: 'LOGIN',
    resource: 'Auth',
    ipAddress: '203.0.113.50',
  },
];

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.tenant.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesTenant = tenantFilter === 'all' || log.tenant === tenantFilter;
    return matchesSearch && matchesAction && matchesTenant;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track all system activity for compliance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Events" value="1,247" icon={<FileText className="w-4 h-4" />} />
        <StatCard title="Today" value="42" icon={<Calendar className="w-4 h-4" />} />
        <StatCard title="Critical Actions" value="3" icon={<Shield className="w-4 h-4" />} />
        <StatCard title="Failed Actions" value="0" icon={<XCircle className="w-4 h-4" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by user, action, tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 text-sm"
        >
          <option value="all">All Actions</option>
          <option value="TENANT_SUSPEND">Tenant Suspend</option>
          <option value="MODULE_TOGGLE">Module Toggle</option>
          <option value="PAYMENT_REFUND">Payment Refund</option>
          <option value="CONFIG_UPDATE">Config Update</option>
          <option value="LOGIN">Login</option>
        </select>
        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 text-sm"
        >
          <option value="all">All Tenants</option>
          <option value="city-general">City General</option>
          <option value="sunset-clinic">Sunset Clinic</option>
          <option value="metro-lab">Metro Lab</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 text-sm"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Timestamp</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Actor</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Action</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Resource</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Tenant</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Changes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">
                      {log.timestamp.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-gray-300 text-sm">{log.actorName}</p>
                      <p className="text-gray-500 text-xs">{log.actorRole}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{log.resource}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{log.tenant}</span>
                  </td>
                  <td className="px-4 py-3">
                    {log.oldValue && log.newValue ? (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-red-400">{log.oldValue}</span>
                        <span className="text-gray-600">→</span>
                        <span className="text-green-400">{log.newValue}</span>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
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

function StatCard({ title, value, icon }: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs">{title}</p>
          <p className="text-gray-100 text-xl font-semibold mt-1">{value}</p>
        </div>
        <div className="text-gray-600">{icon}</div>
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const getColor = (action: string) => {
    if (action.includes('SUSPEND') || action.includes('DELETE')) return 'red';
    if (action.includes('CREATE') || action.includes('ENABLE')) return 'green';
    if (action.includes('UPDATE') || action.includes('CONFIG')) return 'blue';
    return 'gray';
  };
  const color = getColor(action);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs bg-${color}-900/30 text-${color}-400`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
}
