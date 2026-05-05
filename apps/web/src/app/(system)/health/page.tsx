'use client';

import React, { useState } from 'react';
import {
  Activity,
  Server,
  Database,
  Globe,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Cpu,
  HardDrive,
  Wifi,
} from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastCheck: Date;
}

interface SyncNode {
  id: string;
  name: string;
  type: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  lastHeartbeat: Date;
  version: string;
  latency: number;
  queueSize: number;
}

// Mock data
const HEALTH_METRICS: HealthMetric[] = [
  { name: 'API Gateway', status: 'healthy', latency: 42, uptime: 99.99, lastCheck: new Date() },
  { name: 'Database Cluster', status: 'healthy', latency: 18, uptime: 99.95, lastCheck: new Date() },
  { name: 'Auth Service', status: 'healthy', latency: 12, uptime: 99.98, lastCheck: new Date() },
  { name: 'File Storage', status: 'healthy', latency: 65, uptime: 99.90, lastCheck: new Date() },
  { name: 'Sync Engine', status: 'degraded', latency: 340, uptime: 98.50, lastCheck: new Date() },
  { name: 'Email Service', status: 'healthy', latency: 28, uptime: 99.85, lastCheck: new Date() },
];

const SYNC_NODES: SyncNode[] = [
  { id: '1', name: 'us-east-1', type: 'EDGE', status: 'HEALTHY', lastHeartbeat: new Date(), version: '2.1.0', latency: 42, queueSize: 12 },
  { id: '2', name: 'eu-west-1', type: 'EDGE', status: 'HEALTHY', lastHeartbeat: new Date(), version: '2.1.0', latency: 89, queueSize: 5 },
  { id: '3', name: 'ap-south-1', type: 'EDGE', status: 'DEGRADED', lastHeartbeat: new Date(Date.now() - 300000), version: '2.0.9', latency: 450, queueSize: 234 },
  { id: '4', name: 'sa-east-1', type: 'EDGE', status: 'HEALTHY', lastHeartbeat: new Date(), version: '2.1.0', latency: 120, queueSize: 0 },
];

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'nodes' | 'alerts'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const healthyCount = HEALTH_METRICS.filter(m => m.status === 'healthy').length;
  const degradedCount = HEALTH_METRICS.filter(m => m.status === 'degraded').length;
  const downCount = HEALTH_METRICS.filter(m => m.status === 'down').length;

  const healthyNodes = SYNC_NODES.filter(n => n.status === 'HEALTHY').length;
  const totalNodes = SYNC_NODES.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">System Health</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time system visibility</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 border text-sm rounded-lg transition-colors ${
              autoRefresh ? 'border-green-600 text-green-400' : 'border-gray-700 text-gray-500'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg">
            <RefreshCw className="w-4 h-4" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          title="Overall Health"
          value="98.5%"
          status="healthy"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatusCard
          title="Services"
          value={`${healthyCount}/${HEALTH_METRICS.length}`}
          status={downCount > 0 ? 'down' : degradedCount > 0 ? 'degraded' : 'healthy'}
          icon={<Server className="w-5 h-5" />}
        />
        <StatusCard
          title="Sync Nodes"
          value={`${healthyNodes}/${totalNodes}`}
          status={healthyNodes === totalNodes ? 'healthy' : 'degraded'}
          icon={<Globe className="w-5 h-5" />}
        />
        <StatusCard
          title="Active Users"
          value="1,247"
          status="healthy"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {(['overview', 'nodes', 'alerts'] as const).map(tab => (
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
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Service Health Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4">Service Status</h3>
            <div className="space-y-3">
              {HEALTH_METRICS.map(service => (
                <ServiceRow key={service.name} service={service} />
              ))}
            </div>
          </div>

          {/* Resource Usage Chart Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                CPU Usage
              </h3>
              <div className="h-32 flex items-center justify-center border border-gray-800 rounded-lg bg-gray-800/30">
                <p className="text-gray-500 text-sm">CPU chart visualization</p>
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">Avg: 34% • Peak: 78%</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                Memory Usage
              </h3>
              <div className="h-32 flex items-center justify-center border border-gray-800 rounded-lg bg-gray-800/30">
                <p className="text-gray-500 text-sm">Memory chart visualization</p>
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">Avg: 56% • Peak: 82%</p>
            </div>
          </div>

          {/* Latency Chart Placeholder */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-400" />
              API Latency (Last 24h)
            </h3>
            <div className="h-48 flex items-center justify-center border border-gray-800 rounded-lg bg-gray-800/30">
              <p className="text-gray-500 text-sm">Latency chart visualization</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nodes' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-gray-300 text-sm font-medium">Sync Nodes</h3>
            <p className="text-gray-500 text-xs mt-0.5">Track local ↔ cloud synchronization</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Node</th>
                  <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Latency</th>
                  <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Queue</th>
                  <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Version</th>
                  <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody>
                {SYNC_NODES.map(node => (
                  <tr key={node.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className={`w-4 h-4 ${
                          node.status === 'HEALTHY' ? 'text-green-400' :
                          node.status === 'DEGRADED' ? 'text-yellow-400' : 'text-red-400'
                        }`} />
                        <span className="text-gray-300 text-sm">{node.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-sm">{node.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <NodeStatusBadge status={node.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${
                        node.latency < 100 ? 'text-green-400' :
                        node.latency < 300 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{node.latency}ms</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${node.queueSize > 100 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {node.queueSize} pending
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-500 text-xs">{node.version}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-xs">
                        {Math.floor((Date.now() - node.lastHeartbeat.getTime()) / 1000)}s ago
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && <AlertsTab />}
    </div>
  );
}

function ServiceRow({ service }: { service: HealthMetric }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <StatusIndicator status={service.status} />
        <div>
          <p className="text-gray-300 text-sm">{service.name}</p>
          <p className="text-gray-500 text-xs">Uptime: {service.uptime}%</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className={`text-sm ${
            service.latency < 100 ? 'text-green-400' :
            service.latency < 300 ? 'text-yellow-400' : 'text-red-400'
          }`}>{service.latency}ms</p>
          <p className="text-gray-600 text-xs">latency</p>
        </div>
        <StatusBadge status={service.status} />
      </div>
    </div>
  );
}

function StatusCard({ title, value, status, icon }: {
  title: string;
  value: string;
  status: 'healthy' | 'degraded' | 'down';
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs">{title}</p>
          <p className="text-gray-100 text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${
          status === 'healthy' ? 'bg-green-600/10 text-green-400' :
          status === 'degraded' ? 'bg-yellow-600/10 text-yellow-400' :
          'bg-red-600/10 text-red-400'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  return (
    <div className={`w-2.5 h-2.5 rounded-full ${
      status === 'healthy' ? 'bg-green-400' :
      status === 'degraded' ? 'bg-yellow-400' :
      'bg-red-400'
    }`} />
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      status === 'healthy' ? 'bg-green-900/30 text-green-400' :
      status === 'degraded' ? 'bg-yellow-900/30 text-yellow-400' :
      'bg-red-900/30 text-red-400'
    }`}>
      {status === 'healthy' && <CheckCircle className="w-3 h-3" />}
      {status === 'degraded' && <Clock className="w-3 h-3" />}
      {status === 'down' && <XCircle className="w-3 h-3" />}
      {status}
    </span>
  );
}

function NodeStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
      status === 'HEALTHY' ? 'bg-green-900/30 text-green-400' :
      status === 'DEGRADED' ? 'bg-yellow-900/30 text-yellow-400' :
      'bg-red-900/30 text-red-400'
    }`}>{status}</span>
  );
}

function AlertsTab() {
  const alerts = [
    { id: '1', severity: 'critical', message: 'Sync node ap-south-1 latency > 400ms for 15 minutes', time: '10 min ago' },
    { id: '2', severity: 'warning', message: 'Database connection pool 80% utilized', time: '30 min ago' },
    { id: '3', severity: 'warning', message: '3 tenants approaching storage quota (90%+)', time: '1 hour ago' },
    { id: '4', severity: 'info', message: 'System backup completed successfully', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div key={alert.id} className={`p-4 rounded-xl border ${
          alert.severity === 'critical' ? 'bg-red-900/10 border-red-800/50' :
          alert.severity === 'warning' ? 'bg-yellow-900/10 border-yellow-800/50' :
          'bg-blue-900/10 border-blue-800/50'
        }`}>
          <div className="flex items-start gap-3">
            {alert.severity === 'critical' && <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />}
            {alert.severity === 'info' && <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className={`text-sm ${
                alert.severity === 'critical' ? 'text-red-300' :
                alert.severity === 'warning' ? 'text-yellow-300' :
                'text-blue-300'
              }`}>{alert.message}</p>
              <p className="text-gray-500 text-xs mt-1">{alert.time}</p>
            </div>
            <button className="text-xs text-gray-500 hover:text-gray-300">
              Acknowledge
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
