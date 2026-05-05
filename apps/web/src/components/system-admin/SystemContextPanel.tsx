'use client';

import React from 'react';
import { X, Zap, FileText, BarChart3 } from 'lucide-react';

type ContentType = 'actions' | 'logs' | 'insights';

interface SystemContextPanelProps {
  contentType: ContentType;
  onClose: () => void;
  onSwitchType: (type: ContentType) => void;
}

export default function SystemContextPanel({ contentType, onClose, onSwitchType }: SystemContextPanelProps) {
  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex gap-1">
          <PanelTab
            active={contentType === 'actions'}
            onClick={() => onSwitchType('actions')}
            icon={<Zap className="w-4 h-4" />}
            label="Actions"
          />
          <PanelTab
            active={contentType === 'logs'}
            onClick={() => onSwitchType('logs')}
            icon={<FileText className="w-4 h-4" />}
            label="Logs"
          />
          <PanelTab
            active={contentType === 'insights'}
            onClick={() => onSwitchType('insights')}
            icon={<BarChart3 className="w-4 h-4" />}
            label="Insights"
          />
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {contentType === 'actions' && <ActionsPanel />}
        {contentType === 'logs' && <LogsPanel />}
        {contentType === 'insights' && <InsightsPanel />}
      </div>
    </aside>
  );
}

function PanelTab({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-600/20 text-blue-400'
          : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ActionsPanel() {
  return (
    <div className="space-y-3">
      <h3 className="text-gray-300 text-sm font-medium mb-3">Quick Actions</h3>

      <ActionButton
        label="Create New Tenant"
        description="Provision a new hospital/clinic"
        href="/system/tenants/new"
      />
      <ActionButton
        label="Suspend Tenant"
        description="Temporarily disable access"
        href="#"
        variant="danger"
      />
      <ActionButton
        label="Enable Feature Flag"
        description="Toggle system-wide features"
        href="/system/modules/flags"
      />
      <ActionButton
        label="Send System Alert"
        description="Broadcast to all tenants"
        href="#"
      />
      <ActionButton
        label="Export Audit Logs"
        description="Download compliance report"
        href="#"
      />
      <ActionButton
        label="Manage Billing Plans"
        description="Update pricing & quotas"
        href="/system/billing/plans"
      />
    </div>
  );
}

function LogsPanel() {
  const recentLogs = [
    { action: 'TENANT_CREATE', actor: 'admin@system', time: '2 min ago' },
    { action: 'MODULE_TOGGLE', actor: 'ops_admin', time: '15 min ago' },
    { action: 'CONFIG_UPDATE', actor: 'admin@system', time: '1 hour ago' },
    { action: 'TENANT_SUSPEND', actor: 'ops_admin', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-gray-300 text-sm font-medium mb-3">Recent Activity</h3>

      <div className="space-y-2">
        {recentLogs.map((log, i) => (
          <div key={i} className="p-2 bg-gray-800/50 rounded-md">
            <p className="text-gray-300 text-xs font-mono">{log.action}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-gray-500 text-xs">{log.actor}</p>
              <p className="text-gray-600 text-xs">{log.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full text-center text-blue-400 hover:text-blue-300 text-xs py-2">
        View All Logs →
      </button>
    </div>
  );
}

function InsightsPanel() {
  return (
    <div className="space-y-4">
      <h3 className="text-gray-300 text-sm font-medium mb-3">System Insights</h3>

      <InsightCard
        title="Tenant Growth"
        value="+12%"
        description="vs last month"
        trend="up"
      />
      <InsightCard
        title="Avg Response Time"
        value="142ms"
        description="Last 24 hours"
        trend="stable"
      />
      <InsightCard
        title="Failed Payments"
        value="3"
        description="Last 7 days"
        trend="down"
      />
      <InsightCard
        title="Storage Usage"
        value="67%"
        description="Of total capacity"
        trend="up"
      />
    </div>
  );
}

function ActionButton({ label, description, href, variant = 'default' }: {
  label: string;
  description: string;
  href: string;
  variant?: 'default' | 'danger';
}) {
  return (
    <a
      href={href}
      className={`block p-3 rounded-lg border transition-colors ${
        variant === 'danger'
          ? 'border-red-800/50 hover:bg-red-900/20 bg-red-900/10'
          : 'border-gray-800 hover:bg-gray-800/50 bg-gray-800/30'
      }`}
    >
      <p className={`text-sm font-medium ${
        variant === 'danger' ? 'text-red-400' : 'text-gray-300'
      }`}>{label}</p>
      <p className="text-gray-500 text-xs mt-0.5">{description}</p>
    </a>
  );
}

function InsightCard({ title, value, description, trend }: {
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
}) {
  return (
    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-800">
      <p className="text-gray-500 text-xs">{title}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-gray-200 text-lg font-semibold">{value}</p>
        <span className={`text-xs ${
          trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {description}
        </span>
      </div>
    </div>
  );
}
