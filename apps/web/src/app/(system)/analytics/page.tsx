'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Activity,
  Globe,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Loader2,
} from 'lucide-react';
import { getPlatformAnalytics } from '@/app/actions/ui-actions';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await getPlatformAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const tenantGrowth = analytics?.tenantGrowth || [];
  const revenueByMonth = analytics?.revenueByMonth || [];
  const moduleAdoption = analytics?.moduleAdoption || [];
  const geographicDistribution = analytics?.geographicDistribution || [];
  const usageStats = analytics?.usageStats || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform-wide insights and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Tenants" value={kpis.totalTenants?.toString() || '0'} change={`+${kpis.totalTenants - kpis.activeTenants} this month`} trend="up" icon={<Building2 className="w-5 h-5" />} />
        <KpiCard title="Active Users" value={kpis.totalUsers?.toLocaleString() || '0'} change="+89 this week" trend="up" icon={<Users className="w-5 h-5" />} />
        <KpiCard title="Monthly Revenue" value={kpis.monthlyRevenue || '$0'} change={kpis.revenueGrowth || '0%'} trend="up" icon={<DollarSign className="w-5 h-5" />} />
        <KpiCard title="System Uptime" value={kpis.uptime || '0%'} change="0.02% vs last month" trend="up" icon={<Activity className="w-5 h-5" />} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Patients" value={kpis.totalPatients?.toLocaleString() || '0'} icon={<Users className="w-4 h-4" />} />
        <KpiCard title="Avg Response Time" value={kpis.avgResponseTime || '0ms'} trend="up" icon={<Activity className="w-4 h-4" />} />
        <KpiCard title="Active Tenants" value={`${kpis.activeTenants || 0}/${kpis.totalTenants || 0}`} icon={<Building2 className="w-4 h-4" />} />
        <KpiCard title="API Calls (24h)" value={usageStats.apiCalls24h || '0'} icon={<Globe className="w-4 h-4" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tenant Growth Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Tenant Growth
            </h3>
          </div>
          <div className="h-48 flex items-end gap-1">
            {tenantGrowth.map((item: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-600/80 hover:bg-blue-500 rounded-t transition-all"
                  style={{ height: `${Math.max((item.count / (kpis.totalTenants || 50)) * 100, 4)}%` }}
                />
                <span className="text-gray-600 text-xs">{item.month?.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Revenue Trend
            </h3>
          </div>
          <div className="h-48 flex items-end gap-1">
            {revenueByMonth.map((item: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-green-600/80 hover:bg-green-500 rounded-t transition-all"
                  style={{ height: `${Math.max((item.revenue / Math.max(...revenueByMonth.map((r: any) => r.revenue), 130000)) * 100, 4)}%` }}
                />
                <span className="text-gray-600 text-xs">{item.month?.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Adoption & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module Adoption */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            Module Adoption
          </h3>
          <div className="space-y-3">
            {moduleAdoption.map((item: any) => (
              <div key={item.module}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">{item.module}</span>
                  <span className="text-gray-500 text-xs">{item.tenants} tenants ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Geographic Distribution
          </h3>
          <div className="space-y-4">
            {geographicDistribution.map((item: any) => (
              <div key={item.region} className="flex items-center gap-3">
                <div className="w-12 text-gray-500 text-xs">{item.region}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-gray-300 text-sm">{item.count}</span>
                  <span className="text-gray-600 text-xs ml-1">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Bar Chart Representation */}
          <div className="mt-6 space-y-2">
            <p className="text-gray-500 text-xs uppercase">Region Summary</p>
            <div className="grid grid-cols-4 gap-2">
              {geographicDistribution.map((item: any) => (
                <div key={item.region} className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300 text-lg font-semibold">{item.count}</p>
                  <p className="text-gray-600 text-xs mt-1">{item.region?.split('-')[1]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-yellow-400" />
          System Usage Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UsageStat label="Total Storage" value={usageStats.totalStorage || '0 TB'} />
          <UsageStat label="API Calls (24h)" value={usageStats.apiCalls24h || '0'} />
          <UsageStat label="Avg Latency" value={usageStats.avgLatency || '0ms'} />
          <UsageStat label="Error Rate" value={usageStats.errorRate || '0%'} />
          <UsageStat label="Active Sessions" value={usageStats.activeSessions?.toString() || '0'} />
          <UsageStat label="Peak Concurrent" value={usageStats.peakConcurrent?.toString() || '0'} />
          <UsageStat label="Data Transfer (24h)" value={usageStats.dataTransfer24h || '0 GB'} />
          <UsageStat label="Cache Hit Rate" value={usageStats.cacheHitRate || '0%'} />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, trend, icon }: {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs">{title}</p>
          <p className="text-gray-100 text-xl font-semibold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'
            }`}>{change}</p>
          )}
        </div>
        <div className="p-2 bg-gray-800 rounded-lg text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function UsageStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-gray-300 text-sm font-medium mt-1">{value}</p>
    </div>
  );
}
