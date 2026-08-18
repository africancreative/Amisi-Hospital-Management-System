'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Shield,
  User,
  Stethoscope,
  Pill,
  Beaker,
  Heart,
  ChevronDown,
  Edit,
  Trash2,
  Check,
  X,
} from 'lucide-react';

interface RoleDefinition {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  color: string;
}

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant: string;
  status: 'active' | 'inactive';
  lastLogin: Date;
}

const ROLES: RoleDefinition[] = [
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Admin',
    description: 'Full system access including tenant management, billing, and system configuration',
    permissions: ['system:full'],
    color: 'purple',
  },
  {
    name: 'OPERATIONS_ADMIN',
    displayName: 'Operations Admin',
    description: 'Manage tenants, modules, and system health monitoring',
    permissions: ['system:tenants:read', 'system:tenants:write', 'system:modules:read', 'system:modules:write', 'system:health:read', 'system:health:manage'],
    color: 'blue',
  },
  {
    name: 'FINANCE_ADMIN',
    displayName: 'Finance Admin',
    description: 'Manage billing, subscriptions, payments, and financial reports',
    permissions: ['system:billing:read', 'system:billing:write', 'system:billing:refund', 'system:audit:read', 'system:audit:export'],
    color: 'green',
  },
  {
    name: 'SUPPORT_ENGINEER',
    displayName: 'Support Engineer',
    description: 'Read-only access to tenants, modules, health status, and audit logs for troubleshooting',
    permissions: ['system:tenants:read', 'system:modules:read', 'system:health:read', 'system:audit:read'],
    color: 'yellow',
  },
];

const MOCK_USERS: UserWithRole[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'john@amisimedos.com',
    role: 'SUPER_ADMIN',
    tenant: 'System',
    status: 'active',
    lastLogin: new Date('2026-05-04'),
  },
  {
    id: '2',
    name: 'Sarah Operations',
    email: 'sarah@amisimedos.com',
    role: 'OPERATIONS_ADMIN',
    tenant: 'System',
    status: 'active',
    lastLogin: new Date('2026-05-03'),
  },
  {
    id: '3',
    name: 'Mike Finance',
    email: 'mike@amisimedos.com',
    role: 'FINANCE_ADMIN',
    tenant: 'System',
    status: 'active',
    lastLogin: new Date('2026-05-02'),
  },
  {
    id: '4',
    name: 'Lisa Support',
    email: 'lisa@amisimedos.com',
    role: 'SUPPORT_ENGINEER',
    tenant: 'System',
    status: 'inactive',
    lastLogin: new Date('2026-04-28'),
  },
];

// Permission matrix for display
const ALL_PERMISSIONS = [
  { resource: 'Tenants', actions: ['Read', 'Write', 'Suspend', 'Terminate'] },
  { resource: 'Modules', actions: ['Read', 'Write', 'Flags'] },
  { resource: 'Billing', actions: ['Read', 'Write', 'Refund'] },
  { resource: 'Health', actions: ['Read', 'Manage'] },
  { resource: 'Audit', actions: ['Read', 'Export'] },
  { resource: 'Settings', actions: ['Read', 'Write'] },
  { resource: 'Admins', actions: ['Read', 'Write'] },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showRoleMatrix, setShowRoleMatrix] = useState(false);

  const filteredUsers = MOCK_USERS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                         u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">User & Role Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Control access across the platform</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRoleMatrix(!showRoleMatrix)}
            className={`flex items-center gap-2 px-4 py-2 border text-sm rounded-lg transition-colors ${
              showRoleMatrix
                ? 'border-blue-600 text-blue-400 bg-blue-600/10'
                : 'border-gray-700 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            Role Matrix
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map(role => (
          <div key={role.name} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-4 h-4 text-${role.color}-400`} />
              <h3 className="text-gray-200 text-sm font-medium">{role.displayName}</h3>
            </div>
            <p className="text-gray-500 text-xs mb-3">{role.description}</p>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 3).map((perm, i) => (
                <span key={i} className={`text-xs px-1.5 py-0.5 rounded bg-${role.color}-900/30 text-${role.color}-400`}>
                  {perm.split(':')[0]}
                </span>
              ))}
              {role.permissions.length > 3 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">
                  +{role.permissions.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role Permission Matrix */}
      {showRoleMatrix && <RoleMatrix roles={ROLES} permissions={ALL_PERMISSIONS} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 text-sm focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Roles</option>
          {ROLES.map(r => (
            <option key={r.name} value={r.name}>{r.displayName}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Last Login</th>
                <th className="text-right text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} roles={ROLES} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{user.lastLogin.toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

function RoleMatrix({ roles, permissions }: {
  roles: RoleDefinition[];
  permissions: { resource: string; actions: string[] }[];
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 overflow-x-auto">
      <h3 className="text-gray-300 text-sm font-medium mb-4">Permission Matrix</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left text-gray-500 text-xs px-3 py-2">Resource</th>
            {roles.map(role => (
              <th key={role.name} className="text-center text-gray-400 text-xs px-3 py-2">
                {role.displayName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map(group => (
            <>
              {group.actions.map((action, i) => (
                <tr key={`${group.resource}-${action}`} className="border-b border-gray-800/50">
                  <td className="px-3 py-2">
                    {i === 0 && (
                      <span className="text-gray-300 text-sm font-medium">{group.resource}</span>
                    )}
                    <span className={`text-xs ml-2 ${i === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                      {action}
                    </span>
                  </td>
                  {roles.map(role => {
                    const hasPermission = role.permissions.includes(
                      `${group.resource.toLowerCase()}:${action.toLowerCase()}`
                    );
                    return (
                      <td key={role.name} className="text-center px-3 py-2">
                        {hasPermission ? (
                          <Check className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-700 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoleBadge({ role, roles }: { role: string; roles: RoleDefinition[] }) {
  const roleDef = roles.find(r => r.name === role);
  const color = roleDef?.color || 'gray';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-${color}-900/30 text-${color}-400`}>
      <Shield className="w-3 h-3" />
      {roleDef?.displayName || role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      status === 'active'
        ? 'bg-green-900/30 text-green-400'
        : 'bg-gray-800 text-gray-500'
    }`}>
      {status === 'active' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {status}
    </span>
  );
}
