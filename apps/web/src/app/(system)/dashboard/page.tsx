'use client';

import React from 'react';
import {
  Building2,
  CreditCard,
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Server,
  Database,
  Globe,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  href?: string;
}

function MetricCard({ title, value, change, trend, icon, href }: MetricCardProps) {
  const content = (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-gray-100 text-2xl font-semibold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'
            }`}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {change}
            </p>
          )}
        </div>
        <div className="p-2.5 bg-blue-600/10 rounded-lg text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href} className="block">{content}</Link> : content;
}

export default function SystemDashboard() {
  const systemHealth = {
    overall: 98.5,
    database: 'healthy',
    api: 'healthy',
    sync: 'degraded',
    lastIncident: '2 days ago',
  };

  const recentTenants = [
    { name: 'City General Hospital', slug: 'city-general', tier: 'HOSPITAL', status: 'active', joined: '2 days ago' },
    { name: 'Sunset Clinic', slug: 'sunset-clinic', tier: 'CLINIC', status: 'active', joined: '5 days ago' },
    { name: 'Metro Lab Services', slug: 'metro-lab', tier: 'LAB', status: 'suspended', joined: '1 week ago' },
  ];

  const criticalAlerts = [
    { id: '1', message: 'Sync node "us-east-1" experiencing high latency', severity: 'high' },
    { id: '2', message: '3 tenants approaching storage quota (90%+)', severity: 'medium' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">System Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">Global SaaS control plane status</p>
        </div>
        <Link
          href="/system/audit"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
        >
          View Audit Logs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tenants"
          value="42"
          change="+3 this month"
          trend="up"
          icon={<Building2 className="w-5 h-5" />}
          href="/system/tenants"
        />
        <MetricCard
          title="Monthly Revenue"
          value="$124.5K"
          change="+12% vs last month"
          trend="up"
          icon={<CreditCard className="w-5 h-5" />}
          href="/system/billing"
        />
        <MetricCard
          title="Active Users"
          value="1,247"
          change="+89 this week"
          trend="up"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="System Health"
          value={`${systemHealth.overall}%`}
          change="Last incident: 2d ago"
          trend="up"
          icon={<Activity className="w-5 h-5" />}
          href="/system/health"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              System Health
            </h2>

            <div className="space-y-3">
              <HealthItem label="API Gateway" status="healthy" latency="42ms" />
              <HealthItem label="Database Cluster" status="healthy" latency="18ms" />
              <HealthItem label="Sync Engine" status="degraded" latency="340ms" />
              <HealthItem label="Auth Service" status="healthy" latency="12ms" />
              <HealthItem label="File Storage" status="healthy" latency="65ms" />
            </div>

            <Link
              href="/system/health"
              className="block text-center text-blue-400 hover:text-blue-300 text-xs mt-4 py-2 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
            >
              View Full Status →
            </Link>
          </div>
        </div>

        {/* Recent Tenants */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Recent Tenants
            </h2>

            <div className="space-y-2">
              {recentTenants.map((tenant) => (
                <Link
                  key={tenant.slug}
                  href={`/system/tenants/${tenant.slug}`}
                  className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">{tenant.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{tenant.tier} • {tenant.joined}</p>
                    </div>
                    <StatusBadge status={tenant.status} />
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/system/tenants"
              className="block text-center text-blue-400 hover:text-blue-300 text-xs mt-4 py-2 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
            >
              View All Tenants →
            </Link>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Critical Alerts
            </h2>

            {criticalAlerts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No critical alerts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.severity === 'high'
                        ? 'bg-red-900/10 border-red-800/50'
                        : 'bg-yellow-900/10 border-yellow-800/50'
                    }`}
                  >
                    <p className={`text-sm ${
                      alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                    }`}>{alert.message}</p>
                    <button className="text-xs text-gray-500 hover:text-gray-300 mt-1">
                      Investigate →
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/system/health/alerts"
              className="block text-center text-blue-400 hover:text-blue-300 text-xs mt-4 py-2 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
            >
              View All Alerts →
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-300 text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Revenue Overview
          </h2>
          <select className="bg-gray-800 text-gray-400 text-xs rounded-md border border-gray-700 px-2 py-1">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
          </select>
        </div>
        <div className="h-48 flex items-center justify-center border border-gray-800 rounded-lg bg-gray-800/30">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Revenue chart visualization</p>
            <p className="text-gray-600 text-xs mt-1">Integration with charting library pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthItem({ label, status, latency }: {
  label: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'healthy' ? 'bg-green-400' : status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
        }`} />
        <span className="text-gray-300 text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs">{latency}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          status === 'healthy' ? 'bg-green-900/30 text-green-400' :
          status === 'degraded' ? 'bg-yellow-900/30 text-yellow-400' :
          'bg-red-900/30 text-red-400'
        }`}>{status}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${
      status === 'active' ? 'bg-green-900/30 text-green-400' :
      status === 'suspended' ? 'bg-red-900/30 text-red-400' :
      'bg-gray-800 text-gray-400'
    }`}>
      {status}
    </span>
  );
}
