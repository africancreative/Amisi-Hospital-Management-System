'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Puzzle,
  CreditCard,
  Activity,
  FileText,
  Settings,
  Shield,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  children?: Omit<NavItem, 'children'>[];
}

interface SystemSidebarProps {
  userRole: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/system/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Tenants',
    href: '/system/tenants',
    icon: <Building2 className="w-5 h-5" />,
    permission: 'system:tenants:read',
    children: [
      { label: 'All Tenants', href: '/system/tenants', icon: <Building2 className="w-4 h-4" /> },
      { label: 'New Tenant', href: '/system/tenants/new', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Suspended', href: '/system/tenants?suspended=true', icon: <Building2 className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Modules',
    href: '/system/modules',
    icon: <Puzzle className="w-5 h-5" />,
    permission: 'system:modules:read',
    children: [
      { label: 'All Modules', href: '/system/modules', icon: <Puzzle className="w-4 h-4" /> },
      { label: 'Feature Flags', href: '/system/modules/flags', icon: <Puzzle className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Billing',
    href: '/system/billing',
    icon: <CreditCard className="w-5 h-5" />,
    permission: 'system:billing:read',
    children: [
      { label: 'Subscriptions', href: '/system/billing/subscriptions', icon: <CreditCard className="w-4 h-4" /> },
      { label: 'Payments', href: '/system/billing/payments', icon: <CreditCard className="w-4 h-4" /> },
      { label: 'Plans', href: '/system/billing/plans', icon: <CreditCard className="w-4 h-4" /> },
    ],
  },
  {
    label: 'System Health',
    href: '/system/health',
    icon: <Activity className="w-5 h-5" />,
    permission: 'system:health:read',
    children: [
      { label: 'Overview', href: '/system/health', icon: <Activity className="w-4 h-4" /> },
      { label: 'Sync Nodes', href: '/system/health/nodes', icon: <Activity className="w-4 h-4" /> },
      { label: 'Alerts', href: '/system/health/alerts', icon: <Activity className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Audit Logs',
    href: '/system/audit',
    icon: <FileText className="w-5 h-5" />,
    permission: 'system:audit:read',
  },
  {
    label: 'Settings',
    href: '/system/settings',
    icon: <Settings className="w-5 h-5" />,
    permission: 'system:settings:read',
    children: [
      { label: 'General', href: '/system/settings', icon: <Settings className="w-4 h-4" /> },
      { label: 'Admins', href: '/system/settings/admins', icon: <Users className="w-4 h-4" /> },
      { label: 'Security', href: '/system/settings/security', icon: <Shield className="w-4 h-4" /> },
    ],
  },
];

export default function SystemSidebar({ userRole }: SystemSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    const rolePermissions: Record<string, string[]> = {
      SUPER_ADMIN: ['system:full', 'system:tenants:read', 'system:modules:read', 'system:billing:read', 'system:health:read', 'system:audit:read', 'system:settings:read'],
      OPERATIONS_ADMIN: ['system:tenants:read', 'system:modules:read', 'system:health:read', 'system:audit:read', 'system:settings:read'],
      FINANCE_ADMIN: ['system:billing:read', 'system:audit:read'],
      SUPPORT_ENGINEER: ['system:tenants:read', 'system:modules:read', 'system:health:read', 'system:audit:read'],
    };
    const perms = rolePermissions[userRole] || [];
    return perms.includes('system:full') || perms.includes(permission);
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <Link href="/system/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">AmisiMedOS</h1>
            <p className="text-gray-400 text-xs">System Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.filter(item => hasPermission(item.permission)).map((item) => (
          <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => item.children && toggleExpand(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.children && (
                  expandedItems.includes(item.label) ?
                    <ChevronDown className="w-4 h-4 shrink-0" /> :
                    <ChevronRight className="w-4 h-4 shrink-0" />
                )}
              </Link>
            {item.children && expandedItems.includes(item.label) && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.filter(child => hasPermission(child.permission)).map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      pathname === child.href
                        ? 'bg-gray-800 text-blue-400'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="shrink-0">{child.icon}</span>
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-gray-300 text-sm font-medium">{userRole.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-300 text-sm truncate">{userRole.replace('_', ' ')}</p>
            <p className="text-gray-500 text-xs">System Level</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
