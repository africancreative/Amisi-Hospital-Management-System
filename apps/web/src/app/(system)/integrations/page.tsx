'use client';

import React, { useState } from 'react';
import {
  Link2,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key,
  Globe,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'FHIR' | 'API' | 'THIRD_PARTY';
  status: 'connected' | 'disconnected' | 'error';
  endpoint?: string;
  lastSync?: Date;
  tenantCount: number;
}

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: Date;
  lastUsed?: Date;
  tenantName: string;
}

// Mock data
const INTEGRATIONS: Integration[] = [
  {
    id: '1',
    name: 'FHIR Server (US Core)',
    type: 'FHIR',
    status: 'connected',
    endpoint: 'https://fhir.amsimedos.com/R4',
    lastSync: new Date('2026-05-04T10:00:00'),
    tenantCount: 38,
  },
  {
    id: '2',
    name: 'M-Pesa Payment Gateway',
    type: 'THIRD_PARTY',
    status: 'connected',
    lastSync: new Date('2026-05-04T09:30:00'),
    tenantCount: 42,
  },
  {
    id: '3',
    name: 'PayPal API',
    type: 'THIRD_PARTY',
    status: 'connected',
    lastSync: new Date('2026-05-04T08:00:00'),
    tenantCount: 35,
  },
  {
    id: '4',
    name: 'Local Lab System',
    type: 'API',
    status: 'error',
    endpoint: 'https://lab.local/api/v1',
    lastSync: new Date('2026-05-03T14:00:00'),
    tenantCount: 5,
  },
];

const API_KEYS: ApiKey[] = [
  { id: '1', name: 'Production API', keyPreview: 'ak_live_*****x7f9', createdAt: new Date('2026-01-15'), lastUsed: new Date('2026-05-04'), tenantName: 'System' },
  { id: '2', name: 'Staging API', keyPreview: 'ak_test_*****a3b2', createdAt: new Date('2026-02-20'), lastUsed: new Date('2026-05-03'), tenantName: 'System' },
  { id: '3', name: 'City General API', keyPreview: 'ak_live_*****c4d1', createdAt: new Date('2026-03-10'), lastUsed: new Date('2026-05-04'), tenantName: 'City General Hospital' },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'integrations' | 'api-keys'>('integrations');
  const [search, setSearch] = useState('');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);

  const filteredIntegrations = INTEGRATIONS.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredKeys = API_KEYS.filter(k =>
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    k.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">Integration Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage external system connections</p>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'integrations' ? 'Add Integration' : 'Create API Key'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Integrations" value={INTEGRATIONS.filter(i => i.status === 'connected').length.toString()} icon={<CheckCircle className="w-4 h-4 text-green-400" />} />
        <StatCard title="Errors" value={INTEGRATIONS.filter(i => i.status === 'error').length.toString()} icon={<XCircle className="w-4 h-4 text-red-400" />} />
        <StatCard title="API Keys" value={API_KEYS.length.toString()} icon={<Key className="w-4 h-4 text-blue-400" />} />
        <StatCard title="Tenants Using" value="42" icon={<Globe className="w-4 h-4 text-purple-400" />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {(['integrations', 'api-keys'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab === 'integrations' ? 'Integrations' : 'API Keys'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIntegrations.map(integration => (
            <div key={integration.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    integration.status === 'connected' ? 'bg-green-600/10 text-green-400' :
                    integration.status === 'error' ? 'bg-red-600/10 text-red-400' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-gray-200 text-sm font-medium">{integration.name}</h3>
                    <p className="text-gray-500 text-xs">{integration.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <StatusBadge status={integration.status} />
              </div>

              {integration.endpoint && (
                <p className="text-gray-600 text-xs mb-2 truncate">{integration.endpoint}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <span className="text-gray-500 text-xs">
                  {integration.tenantCount} tenant{integration.tenantCount !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-1">
                  <button className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs px-4 py-3">Name</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Key</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Tenant</th>
                <th className="text-left text-gray-500 text-xs px-4 py-3">Last Used</th>
                <th className="text-right text-gray-500 text-xs px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map(key => (
                <tr key={key.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">{key.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-gray-500 text-xs bg-gray-800 px-2 py-1 rounded">{key.keyPreview}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{key.tenantName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">
                      {key.lastUsed ? key.lastUsed.toLocaleDateString() : 'Never'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded" title="Copy">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded" title="Revoke">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <NewKeyModal onClose={() => setShowNewKeyModal(false)} />
      )}
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
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs">{title}</p>
          <p className="text-gray-100 text-xl font-semibold mt-1">{value}</p>
        </div>
        <div className="text-gray-600">{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      status === 'connected' ? 'bg-green-900/30 text-green-400' :
      status === 'error' ? 'bg-red-900/30 text-red-400' :
      'bg-gray-800 text-gray-500'
    }`}>
      {status === 'connected' && <CheckCircle className="w-3 h-3" />}
      {status === 'error' && <XCircle className="w-3 h-3" />}
      {status}
    </span>
  );
}

function NewKeyModal({ onClose }: { onClose: () => void }) {
  const [showKey, setShowKey] = useState(false);
  const [generatedKey] = useState('ak_live_7x9f2k3m8n4p5q6r');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-gray-100 text-lg font-medium mb-4">Create API Key</h3>

        {!showKey ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-500 text-xs mb-1.5">Key Name</label>
              <input
                type="text"
                placeholder="Production API Key"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-500 text-xs mb-1.5">Tenant</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm">
                <option>System (Global)</option>
                <option>City General Hospital</option>
                <option>Sunset Family Clinic</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm">Cancel</button>
              <button
                onClick={() => setShowKey(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
              >
                Generate Key
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <p className="text-yellow-300 text-xs">Copy this key now. You won't be able to see it again!</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <code className="text-green-400 text-sm break-all">{generatedKey}</code>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { navigator.clipboard.writeText(generatedKey); }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
