'use client';

import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Info,
  Filter,
  Check,
  Clock,
  Shield,
  Server,
  CreditCard,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'system' | 'billing' | 'sync' | 'security';
  message: string;
  tenantName?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
}

export default function AlertsPage() {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'system' | 'billing' | 'sync' | 'security'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(true);

  const alerts: Alert[] = [
    {
      id: '1',
      severity: 'critical',
      category: 'sync',
      message: 'Sync node ap-south-1 latency > 400ms for 15 minutes',
      createdAt: new Date(Date.now() - 600000),
      acknowledged: false,
      resolved: false,
    },
    {
      id: '2',
      severity: 'critical',
      category: 'billing',
      message: 'Tenant "Metro Lab Services" payment failed - 3 attempts',
      tenantName: 'Metro Lab Services',
      createdAt: new Date(Date.now() - 7200000),
      acknowledged: false,
      resolved: false,
    },
    {
      id: '3',
      severity: 'warning',
      category: 'system',
      message: 'Database connection pool 80% utilized',
      createdAt: new Date(Date.now() - 1800000),
      acknowledged: false,
      resolved: false,
    },
    {
      id: '4',
      severity: 'warning',
      category: 'billing',
      message: '3 tenants approaching storage quota (90%+)',
      createdAt: new Date(Date.now() - 3600000),
      acknowledged: true,
      acknowledgedBy: 'ops_admin',
      acknowledgedAt: new Date(Date.now() - 1800000),
      resolved: false,
    },
    {
      id: '5',
      severity: 'warning',
      category: 'sync',
      message: 'Tenant "Sunset Clinic" sync queue > 100 items',
      tenantName: 'Sunset Clinic',
      createdAt: new Date(Date.now() - 1200000),
      acknowledged: false,
      resolved: false,
    },
    {
      id: '6',
      severity: 'info',
      category: 'system',
      message: 'System backup completed successfully',
      createdAt: new Date(Date.now() - 7200000),
      acknowledged: true,
      acknowledgedBy: 'system',
      acknowledgedAt: new Date(Date.now() - 6000000),
      resolved: true,
    },
  ];

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && alert.category !== filterCategory) return false;
    if (!showAcknowledged && alert.acknowledged) return false;
    return true;
  });

  const stats = {
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length,
    info: alerts.filter(a => a.severity === 'info' && !a.acknowledged).length,
    total: alerts.filter(a => !a.acknowledged).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">Alert Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Detect and respond to issues quickly</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
            <Check className="w-4 h-4" />
            Acknowledge All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Critical" value={stats.critical.toString()} color="red" icon={<XCircle className="w-4 h-4" />} />
        <StatCard title="Warning" value={stats.warning.toString()} color="yellow" icon={<AlertTriangle className="w-4 h-4" />} />
        <StatCard title="Info" value={stats.info.toString()} color="blue" icon={<Info className="w-4 h-4" />} />
        <StatCard title="Total Active" value={stats.total.toString()} color="gray" icon={<Bell className="w-4 h-4" />} />
      </div>

      {/* Alert Rules Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-gray-300 text-sm font-medium mb-3">Alert Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: 'High Sync Latency', condition: '> 300ms for 5 min', enabled: true },
            { name: 'Payment Failure', condition: '≥ 3 attempts', enabled: true },
            { name: 'Storage Quota', condition: '> 90%', enabled: true },
            { name: 'DB Connection', condition: '> 80% pool', enabled: true },
          ].map((rule, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-300 text-xs font-medium">{rule.name}</p>
                <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-400' : 'bg-gray-600'}`} />
              </div>
              <p className="text-gray-500 text-xs">{rule.condition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as typeof filterSeverity)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 text-sm"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="system">System</option>
          <option value="billing">Billing</option>
          <option value="sync">Sync</option>
          <option value="security">Security</option>
        </select>
        <button
          onClick={() => setShowAcknowledged(!showAcknowledged)}
          className={`flex items-center gap-2 px-3 py-2 border text-sm rounded-lg ${
            showAcknowledged ? 'border-blue-600 text-blue-400' : 'border-gray-700 text-gray-500'
          }`}
        >
          {showAcknowledged ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showAcknowledged ? 'Showing All' : 'Hiding Ack'}
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const icon = {
    critical: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  }[alert.severity];

  const bgColor = {
    critical: 'bg-red-900/10 border-red-800/50',
    warning: 'bg-yellow-900/10 border-yellow-800/50',
    info: 'bg-blue-900/10 border-blue-800/50',
  }[alert.severity];

  return (
    <div className={`${bgColor} border rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p className={`text-sm ${
            alert.severity === 'critical' ? 'text-red-300' :
            alert.severity === 'warning' ? 'text-yellow-300' :
            'text-blue-300'
          }`}>{alert.message}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor((Date.now() - alert.createdAt.getTime()) / 60000)} min ago
            </span>
            {alert.tenantName && (
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Server className="w-3 h-3" />
                {alert.tenantName}
              </span>
            )}
            <span className="text-gray-600 text-xs uppercase">{alert.category}</span>
          </div>
          {alert.acknowledged && (
            <p className="text-gray-500 text-xs mt-1">
              Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt?.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {!alert.acknowledged && (
            <button className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded">
              <Check className="w-4 h-4" />
            </button>
          )}
          {!alert.resolved && (
            <button className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-gray-800 rounded">
              <Shield className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: {
  title: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs">{title}</p>
          <p className={`text-2xl font-semibold mt-1 ${
            color === 'red' ? 'text-red-400' :
            color === 'yellow' ? 'text-yellow-400' :
            color === 'blue' ? 'text-blue-400' :
            'text-gray-300'
          }`}>{value}</p>
        </div>
        <div className={`${
          color === 'red' ? 'text-red-400' :
          color === 'yellow' ? 'text-yellow-400' :
          color === 'blue' ? 'text-blue-400' :
          'text-gray-400'
        }`}>{icon}</div>
      </div>
    </div>
  );
}
