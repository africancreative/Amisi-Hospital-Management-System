'use client';

import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, X, Activity, Server, CreditCard, Building2 } from 'lucide-react';
import Link from 'next/link';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  link?: string;
}

interface SystemTopBarProps {
  userName: string;
  userRole: string;
  stats?: any;
}

export default function SystemTopBar({ userName, userRole, stats }: SystemTopBarProps) {
  const [showAlerts, setShowAlerts] = useState(false);

  // Mock alerts - in production, these would come from API
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      message: 'Tenant "City Hospital" database connection failed',
      timestamp: new Date(),
      link: '/system/tenants/city-hospital',
    },
    {
      id: '2',
      type: 'warning',
      message: '3 tenants approaching storage quota limit',
      timestamp: new Date(Date.now() - 3600000),
      link: '/system/billing/quotas',
    },
    {
      id: '3',
      type: 'info',
      message: 'System update scheduled for tonight at 2AM UTC',
      timestamp: new Date(Date.now() - 7200000),
    },
  ]);

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  const systemStats = {
    totalTenants: stats?.kpis?.totalTenants || 0,
    activeSubscriptions: stats?.activeSubscriptions || 0,
    totalRevenue: stats?.kpis?.monthlyRevenue || '$0',
    systemHealth: stats?.kpis?.uptime || '99.9%',
  };

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
      {/* Left: Breadcrumb / Page Title */}
      <div className="flex items-center gap-4">
        <Link href="/system/dashboard" className="text-gray-400 hover:text-gray-200 text-sm">
          AmisiMedOS
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-200 text-sm font-medium">System Admin</span>
      </div>

      {/* Center: Quick Stats */}
      <div className="hidden md:flex items-center gap-6">
        <StatBadge icon={<Building2 className="w-4 h-4" />} label="Total Tenants" value={systemStats.totalTenants.toString()} />
        <StatBadge icon={<CreditCard className="w-4 h-4" />} label="Active Subs" value={systemStats.activeSubscriptions.toString()} />
        <StatBadge icon={<CreditCard className="w-4 h-4" />} label="Monthly Rev (MRR)" value={systemStats.totalRevenue} />
        <StatBadge icon={<Activity className="w-4 h-4" />} label="Uptime" value={systemStats.systemHealth} status={parseFloat(systemStats.systemHealth) > 95 ? 'good' : 'warning'} />
      </div>

      {/* Right: Alerts & User */}
      <div className="flex items-center gap-3">
        {/* Alert Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {(criticalCount + warningCount) > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                criticalCount > 0 ? 'bg-red-500' : 'bg-yellow-500'
              } text-white`}>
                {criticalCount + warningCount}
              </span>
            )}
          </button>

          {/* Alert Dropdown */}
          {showAlerts && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-gray-200 text-sm font-medium">System Alerts</h3>
                <button onClick={() => setShowAlerts(false)} className="text-gray-400 hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="p-4 text-gray-500 text-sm text-center">No active alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <Link
                      key={alert.id}
                      href={alert.link || '#'}
                      className="block p-3 hover:bg-gray-700/50 border-b border-gray-700/50 last:border-0"
                      onClick={() => setShowAlerts(false)}
                    >
                      <div className="flex items-start gap-2">
                        {alert.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                        {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />}
                        {alert.type === 'info' && <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-300 text-sm">{alert.message}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-700">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">{userName.charAt(0)}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-gray-300 text-sm">{userName}</p>
            <p className="text-gray-500 text-xs">{userRole.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatBadge({ icon, label, value, status = 'neutral' }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: 'good' | 'warning' | 'neutral';
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
      <div className={`${status === 'good' ? 'text-green-400' : status === 'warning' ? 'text-yellow-400' : 'text-gray-400'}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className={`text-sm font-medium ${
          status === 'good' ? 'text-green-400' : status === 'warning' ? 'text-yellow-400' : 'text-gray-200'
        }`}>{value}</p>
      </div>
    </div>
  );
}
