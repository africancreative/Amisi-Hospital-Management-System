'use client';

import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Shield,
  CreditCard,
  Bell,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'security' | 'admins'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  // General Settings
  const [platformName, setPlatformName] = useState('AmisiMedOS');
  const [platformSlogan, setPlatformSlogan] = useState('Enterprise Hospital Management');
  const [showHero, setShowHero] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);

  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState(3600);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [requireMFA, setRequireMFA] = useState(false);
  const [auditRetentionDays, setAuditRetentionDays] = useState(365);

  // Billing Settings
  const [paypalEnv, setPaypalEnv] = useState<'sandbox' | 'live'>('sandbox');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">System Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Control global platform behavior</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={() => setHasChanges(false)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {(['general', 'billing', 'security', 'admins'] as const).map(tab => (
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

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Platform Identity
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => { setPlatformName(e.target.value); setHasChanges(true); }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Slogan</label>
                <input
                  type="text"
                  value={platformSlogan}
                  onChange={(e) => { setPlatformSlogan(e.target.value); setHasChanges(true); }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4">Homepage Display</h3>
            <div className="space-y-3">
              <ToggleSetting
                label="Show Hero Section"
                description="Display the main hero banner on the landing page"
                enabled={showHero}
                onChange={(v) => { setShowHero(v); setHasChanges(true); }}
              />
              <ToggleSetting
                label="Show Features Section"
                description="Display platform features on the landing page"
                enabled={showFeatures}
                onChange={(v) => { setShowFeatures(v); setHasChanges(true); }}
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4">Default Tenant Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Default Tier</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm">
                  <option>CLINIC</option>
                  <option>HOSPITAL</option>
                  <option>LAB</option>
                  <option>PHARMACY</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Trial Days</label>
                <input
                  type="number"
                  defaultValue={14}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Default Seat Limit</label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Default Storage (MB)</label>
                <input
                  type="number"
                  defaultValue={5000}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Settings */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-400" />
              PayPal Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Environment</label>
                <select
                  value={paypalEnv}
                  onChange={(e) => { setPaypalEnv(e.target.value as 'sandbox' | 'live'); setHasChanges(true); }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div>
              <SecretInput
                label="Client ID"
                value="sb_abc123..."
                show={!!showSecrets['paypal-client']}
                onToggle={() => toggleSecret('paypal-client')}
              />
              <SecretInput
                label="Client Secret"
                value="secret_xyz789..."
                show={!!showSecrets['paypal-secret']}
                onToggle={() => toggleSecret('paypal-secret')}
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-400" />
              M-Pesa Configuration
            </h3>
            <div className="space-y-4">
              <SecretInput
                label="Consumer Key"
                value="key_abc123..."
                show={!!showSecrets['mpesa-key']}
                onToggle={() => toggleSecret('mpesa-key')}
              />
              <SecretInput
                label="Consumer Secret"
                value="secret_xyz789..."
                show={!!showSecrets['mpesa-secret']}
                onToggle={() => toggleSecret('mpesa-secret')}
              />
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Shortcode</label>
                <input
                  type="text"
                  defaultValue="174379"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
                />
              </div>
              <SecretInput
                label="Passkey"
                value="passkey_abc..."
                show={!!showSecrets['mpesa-passkey']}
                onToggle={() => toggleSecret('mpesa-passkey')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              Authentication & Sessions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Session Timeout (seconds)</label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => { setSessionTimeout(Number(e.target.value)); setHasChanges(true); }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Max Login Attempts</label>
                <input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => { setMaxLoginAttempts(Number(e.target.value)); setHasChanges(true); }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
                />
              </div>
              <ToggleSetting
                label="Require MFA"
                description="Force multi-factor authentication for all admin users"
                enabled={requireMFA}
                onChange={(v) => { setRequireMFA(v); setHasChanges(true); }}
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4">Audit & Compliance</h3>
            <div>
              <label className="block text-gray-500 text-xs mb-1.5">Audit Log Retention (days)</label>
              <input
                type="number"
                value={auditRetentionDays}
                onChange={(e) => { setAuditRetentionDays(Number(e.target.value)); setHasChanges(true); }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
              />
              <p className="text-gray-600 text-xs mt-1.5">Logs older than this will be archived</p>
            </div>
          </div>

          <div className="bg-yellow-900/10 border border-yellow-800/50 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-300 text-xs font-medium">Security Notice</p>
                <p className="text-yellow-200/70 text-xs mt-0.5">
                  Changes to security settings affect all system administrators. Ensure you understand the implications before saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
              <Shield className="w-4 h-4" />
              Add Admin
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 text-sm font-medium mb-4">System Administrators</h3>
            <div className="space-y-3">
              {[
                { name: 'John Admin', email: 'john@amisimedos.com', role: 'SUPER_ADMIN', lastLogin: '2 hours ago' },
                { name: 'Sarah Operations', email: 'sarah@amisimedos.com', role: 'OPERATIONS_ADMIN', lastLogin: '1 day ago' },
                { name: 'Mike Finance', email: 'mike@amisimedos.com', role: 'FINANCE_ADMIN', lastLogin: '3 hours ago' },
              ].map((admin, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">{admin.name}</p>
                      <p className="text-gray-500 text-xs">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      admin.role === 'SUPER_ADMIN' ? 'bg-purple-900/30 text-purple-400' :
                      admin.role === 'OPERATIONS_ADMIN' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>{admin.role.replace('_', ' ')}</span>
                    <span className="text-gray-500 text-xs">{admin.lastLogin}</span>
                    <button className="text-gray-500 hover:text-gray-300 p-1">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSetting({ label, description, enabled, onChange }: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-gray-300 text-sm">{label}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-5.5 left-0.5' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}

function SecretInput({ label, value, show, onToggle }: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="block text-gray-500 text-xs mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          readOnly
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 text-sm font-mono"
        />
        <button
          onClick={onToggle}
          className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
