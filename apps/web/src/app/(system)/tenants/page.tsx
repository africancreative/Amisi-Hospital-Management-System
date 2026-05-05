'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  Loader2,
  CreditCard,
  Database,
  Activity,
  ShieldCheck,
  Clock,
  DollarSign,
  Eye,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { getTenants } from '@/app/actions/tenant-actions';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'terminated';
  tier: string;
  region: string;
  createdAt: Date;
  trialEndsAt?: Date | null;
  enabledModules?: Record<string, boolean>;
  subscriptions?: any[];
  entitlements?: any[];
  payments?: any[];
  usages?: any[];
  tenantFeatureFlags?: any[];
  configAuditLogs?: any[];
}

function getComputedStatus(tenant: Tenant): string {
  if (tenant.status === 'active' && tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date()) {
    return 'trial';
  }
  return tenant.status;
}

function getActiveModules(tenant: Tenant): string[] {
  const modules = tenant.enabledModules || {};
  return Object.entries(modules)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key.toUpperCase());
}

function getLatestUsage(tenant: Tenant) {
  if (!tenant.usages || tenant.usages.length === 0) return null;
  return tenant.usages[tenant.usages.length - 1];
}

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [showSuspendModal, setShowSuspendModal] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenants() {
      try {
        const data = await getTenants();
        setTenants(data);
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                         t.slug.toLowerCase().includes(search.toLowerCase());
    const computedStatus = getComputedStatus(t);
    const matchesStatus = statusFilter === 'all' || computedStatus === statusFilter;
    const matchesTier = tierFilter === 'all' || t.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">Tenants</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage hospital and clinic instances</p>
        </div>
        <Link
          href="/system/tenants/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Tenant
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-gray-500 text-xs">Total Tenants</p>
              <p className="text-gray-100 text-xl font-semibold">{tenants.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-gray-500 text-xs">Active</p>
              <p className="text-gray-100 text-xl font-semibold">
                {tenants.filter(t => getComputedStatus(t) === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Pause className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-gray-500 text-xs">Suspended</p>
              <p className="text-gray-100 text-xl font-semibold">
                {tenants.filter(t => getComputedStatus(t) === 'suspended').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-gray-500 text-xs">Trial</p>
              <p className="text-gray-100 text-xl font-semibold">
                {tenants.filter(t => getComputedStatus(t) === 'trial').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="trial">Trial</option>
          <option value="terminated">Terminated</option>
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Tiers</option>
          <option value="CLINIC">Clinic</option>
          <option value="HOSPITAL">Hospital</option>
          <option value="LAB">Lab</option>
          <option value="PHARMACY">Pharmacy</option>
        </select>
      </div>

      {/* Tenants Table */}
       <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="border-b border-gray-800">
                 <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Name</th>
                 <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Tier</th>
                 <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Status</th>
                 <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Region</th>
                 <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Modules Enabled</th>
                 <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Usage Stats</th>
                 <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Subscription</th>
                 <th className="text-right text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Actions</th>
               </tr>
             </thead>
             <tbody>
               {filteredTenants.map((tenant) => {
                 const usage = getLatestUsage(tenant);
                 const modules = getActiveModules(tenant);
                 return (
                   <tr key={tenant.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                     <td className="px-4 py-3">
                       <Link href={`/system/tenants/${tenant.slug}`} className="flex items-center gap-3 group">
                         <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                           <Building2 className="w-4 h-4 text-gray-400" />
                         </div>
                         <div>
                           <p className="text-gray-300 text-sm font-medium group-hover:text-blue-400 transition-colors">
                             {tenant.name}
                           </p>
                           <p className="text-gray-500 text-xs">{tenant.slug}</p>
                         </div>
                       </Link>
                     </td>
                     <td className="px-4 py-3">
                       <span className="text-gray-400 text-sm">{tenant.tier}</span>
                     </td>
                     <td className="px-4 py-3">
                       <StatusBadge status={tenant.status} trialEndsAt={tenant.trialEndsAt} />
                     </td>
                     <td className="px-4 py-3">
                       <span className="text-gray-400 text-sm">{tenant.region}</span>
                     </td>
                     <td className="px-4 py-3">
                       <div className="flex flex-wrap gap-1">
                         {modules.length > 0 ? modules.slice(0, 3).map((mod) => (
                           <span key={mod} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                             {mod}
                           </span>
                         )) : (
                           <span className="text-gray-500 text-xs">None</span>
                         )}
                         {modules.length > 3 && (
                           <span className="px-1.5 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                             +{modules.length - 3}
                           </span>
                         )}
                       </div>
                     </td>
                     <td className="px-4 py-3">
                       {usage ? (
                         <div className="text-xs">
                           <p className="text-gray-300">{usage.activeUsers || 0} users</p>
                           <p className="text-gray-500">{usage.activePatients || 0} patients</p>
                         </div>
                       ) : (
                         <span className="text-gray-500 text-xs">No data</span>
                       )}
                     </td>
                     <td className="px-4 py-3">
                       {tenant.subscriptions && tenant.subscriptions.length > 0 ? (
                         <div className="text-xs">
                           <p className="text-gray-300">{tenant.subscriptions[0].plan?.name || 'N/A'}</p>
                           <p className="text-gray-500">{tenant.subscriptions[0].status}</p>
                         </div>
                       ) : (
                         <span className="text-gray-500 text-xs">No plan</span>
                       )}
                     </td>
                     <td className="px-4 py-3">
                       <div className="flex items-center justify-end gap-1">
                         <Link
                           href={`/system/tenants/${tenant.slug}`}
                           className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors"
                           title="View Details"
                         >
                           <Eye className="w-4 h-4" />
                         </Link>
                         <Link
                           href={`/system/tenants/${tenant.slug}/edit`}
                           className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded transition-colors"
                           title="Edit"
                         >
                           <Pencil className="w-4 h-4" />
                         </Link>
                         {tenant.status === 'active' ? (
                           <button
                             onClick={() => setShowSuspendModal(tenant.id)}
                             className="p-1.5 text-gray-500 hover:text-yellow-400 hover:bg-gray-800 rounded transition-colors"
                             title="Suspend"
                           >
                             <Pause className="w-4 h-4" />
                           </button>
                         ) : tenant.status === 'suspended' ? (
                           <button className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-gray-800 rounded transition-colors" title="Activate">
                             <Play className="w-4 h-4" />
                           </button>
                         ) : null}
                         <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors" title="Delete">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>

         {filteredTenants.length === 0 && (
           <div className="text-center py-12">
             <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
             <p className="text-gray-500 text-sm">No tenants found</p>
           </div>
         )}
       </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <SuspendModal
          tenant={tenants.find(t => t.id === showSuspendModal)!}
          onClose={() => setShowSuspendModal(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status, trialEndsAt }: { status: string; trialEndsAt?: Date | null }) {
  const computedStatus = status === 'active' && trialEndsAt && new Date(trialEndsAt) > new Date() ? 'trial' : status;

  const config = {
    active: { bg: 'bg-green-900/30', text: 'text-green-400', icon: CheckCircle },
    suspended: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', icon: Pause },
    terminated: { bg: 'bg-red-900/30', text: 'text-red-400', icon: XCircle },
    trial: { bg: 'bg-blue-900/30', text: 'text-blue-400', icon: Clock },
  };
  const { bg, text, icon: Icon } = config[computedStatus as keyof typeof config] || config.active;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {computedStatus}
    </span>
  );
}

function SuspendModal({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <h3 className="text-gray-100 text-lg font-medium">Suspend Tenant</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Are you sure you want to suspend <span className="text-gray-300 font-medium">{tenant.name}</span>?
          This will block all user access immediately.
        </p>
        <div className="mb-4">
          <label className="block text-gray-500 text-xs mb-1.5">Reason for suspension</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
            rows={3}
            placeholder="Enter reason..."
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Suspending tenant:', tenant.id, 'Reason:', reason);
              onClose();
            }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
          >
            Suspend Tenant
          </button>
        </div>
      </div>
    </div>
  );
}
