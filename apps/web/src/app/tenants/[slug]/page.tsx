import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Pause,
  XCircle,
  Clock,
  Eye,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  Activity,
  Database,
  Globe,
  HeartPulse,
  Stethoscope,
  Microscope,
  FlaskConical,
  Shield,
  Boxes,
  Search,
  Hospital,
  Settings,
  AlertCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { getControlDb } from '@amisimedos/db/client';
import { revalidatePath } from 'next/cache';
import { ensureSuperAdmin } from '@/lib/auth-utils';

const MODULES = [
  { id: 'pmi', name: 'PMI', description: 'Patient Master Index', icon: Hospital },
  { id: 'opd', name: 'OPD', description: 'Outpatient Care', icon: Stethoscope },
  { id: 'ipd', name: 'IPD', description: 'Inpatient Care', icon: Activity },
  { id: 'rcm', name: 'RCM', description: 'Revenue Cycle', icon: Settings },
  { id: 'pharmacy', name: 'Pharmacy', description: 'Pharmacy Services', icon: FlaskConical },
  { id: 'lis', name: 'LIS', description: 'Laboratory', icon: Microscope },
  { id: 'ris', name: 'RIS', description: 'Radiology', icon: Shield },
  { id: 'inventory', name: 'Inventory', description: 'Inventory & Supply', icon: Boxes },
  { id: 'ot', name: 'OT', description: 'Operation Theatre', icon: HeartPulse },
  { id: 'icu', name: 'ICU', description: 'Intensive Care', icon: Activity },
  { id: 'ctms', name: 'CTMS', description: 'Clinical Trials', icon: Search },
  { id: 'irb', name: 'IRB', description: 'Ethics Board', icon: Shield },
];

export default async function TenantDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const db = getControlDb();

  const tenant = await db.tenant.findUnique({
    where: { slug: params.slug },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      usages: {
        orderBy: { date: 'desc' },
        take: 30,
      },
      configAuditLogs: {
        orderBy: { timestamp: 'desc' },
        take: 10,
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  const computedStatus = tenant.status === 'active' && tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date()
    ? 'trial'
    : tenant.status;

  const enabledModules = (tenant.enabledModules as Record<string, boolean>) || {};
  const latestUsage = tenant.usages && tenant.usages.length > 0 ? tenant.usages[0] : null;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <Link
              href="/system/tenants"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:underline mb-4"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Tenants
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black tracking-tight">{tenant.name}</h1>
              <TierBadge tier={tenant.tier} />
              <StatusBadge status={tenant.status} trialEndsAt={tenant.trialEndsAt} />
            </div>
            <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" /> {tenant.region} •
              <Database className="h-4 w-4 ml-2" /> ID: {tenant.id.split('-')[0]} •
              <Globe className="h-4 w-4 ml-2" /> Slug: /{tenant.slug}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/system/tenants/${tenant.slug}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <form action={async () => {
              'use server';
              await ensureSuperAdmin();
              const newStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
              await db.tenant.update({
                where: { id: tenant.id },
                data: { status: newStatus },
              });
              revalidatePath(`/system/tenants/${tenant.slug}`);
              revalidatePath('/system/tenants');
            }}>
              <button
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tenant.status === 'suspended'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {tenant.status === 'suspended' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {tenant.status === 'suspended' ? 'Activate' : 'Suspend'}
              </button>
            </form>
            <form action={async () => {
              'use server';
              await ensureSuperAdmin();
              await db.tenant.delete({
                where: { id: tenant.id },
              });
              revalidatePath('/system/tenants');
              redirect('/system/tenants');
            }}>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Section */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Subscription Plan</p>
                  <p className="text-white text-sm font-medium">
                    {tenant.subscriptions && tenant.subscriptions.length > 0
                      ? tenant.subscriptions[0].plan?.name || 'N/A'
                      : 'No Plan'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Created Date</p>
                  <p className="text-white text-sm font-medium">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Region</p>
                  <p className="text-white text-sm font-medium">{tenant.region}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Status</p>
                  <StatusBadge status={tenant.status} trialEndsAt={tenant.trialEndsAt} />
                </div>
              </div>
            </section>

            {/* Modules Enabled Section */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Modules Enabled</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODULES.map((mod) => {
                  const Icon = mod.icon;
                  const isEnabled = !!enabledModules[mod.id];
                  return (
                    <ModuleToggle
                      key={mod.id}
                      tenantId={tenant.id}
                      moduleKey={mod.id}
                      name={mod.name}
                      description={mod.description}
                      enabled={isEnabled}
                      icon={Icon}
                    />
                  );
                })}
              </div>
            </section>

            {/* Usage Stats Section */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Usage Statistics</h2>
              {latestUsage ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1">Storage Used</p>
                    <p className="text-white text-lg font-bold">{Number(latestUsage.storageUsedMb) || 0} MB</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1">API Calls</p>
                    <p className="text-white text-lg font-bold">{latestUsage.apiCallsCount || 0}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1">Active Users</p>
                    <p className="text-white text-lg font-bold">{latestUsage.activeUsers || 0}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1">Active Patients</p>
                    <p className="text-white text-lg font-bold">{latestUsage.activePatients || 0}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No usage data available</p>
              )}
            </section>

            {/* Connected Devices Section */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Connected Devices</h2>
              <DevicesList />
            </section>

            {/* Audit Logs Section */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Audit Logs</h2>
              {tenant.configAuditLogs && tenant.configAuditLogs.length > 0 ? (
                <div className="space-y-3">
                  {tenant.configAuditLogs.map((log: any) => (
                    <div key={log.id} className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white text-sm font-medium">{log.action}</p>
                          {log.field && (
                            <p className="text-gray-400 text-xs mt-1">
                              Field: <span className="text-gray-300">{log.field}</span>
                            </p>
                          )}
                          {log.actorName && (
                            <p className="text-gray-500 text-xs mt-1">
                              By: {log.actorName} ({log.actorRole})
                            </p>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No audit logs available</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Info */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Subscription</h3>
              {tenant.subscriptions && tenant.subscriptions.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs">Plan</p>
                    <p className="text-white text-sm font-medium">{tenant.subscriptions[0].plan?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className="text-white text-sm">{tenant.subscriptions[0].status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Billing Cycle</p>
                    <p className="text-white text-sm">{tenant.subscriptions[0].plan?.billingCycle}</p>
                  </div>
                  {tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date() && (
                    <div>
                      <p className="text-gray-500 text-xs">Trial Ends</p>
                      <p className="text-blue-400 text-sm">{new Date(tenant.trialEndsAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No active subscription</p>
              )}
            </section>

            {/* Quick Stats */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Total Modules</span>
                  <span className="text-white text-xs font-bold">
                    {Object.values(enabledModules).filter(Boolean).length} / {MODULES.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Usage Records</span>
                  <span className="text-white text-xs font-bold">{tenant.usages?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Audit Entries</span>
                  <span className="text-white text-xs font-bold">{tenant.configAuditLogs?.length || 0}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const configs: any = {
    CLINIC: 'border-blue-500 text-blue-400 bg-blue-500/10',
    HOSPITAL: 'border-green-500 text-green-400 bg-green-500/10',
    LAB: 'border-purple-500 text-purple-400 bg-purple-500/10',
    PHARMACY: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
    GENERAL: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
    RESEARCH: 'border-pink-500 text-pink-400 bg-pink-500/10',
  };
  return (
    <span className={`px-2 py-1 border rounded-md text-[10px] font-black uppercase tracking-widest ${configs[tier] || configs.CLINIC}`}>
      {tier}
    </span>
  );
}

function StatusBadge({ status, trialEndsAt }: { status: string; trialEndsAt?: Date | null }) {
  const computedStatus = status === 'active' && trialEndsAt && new Date(trialEndsAt) > new Date() ? 'trial' : status;

  const config = {
    active: { bg: 'bg-green-500/10', text: 'text-green-400', icon: CheckCircle },
    suspended: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Pause },
    terminated: { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
    trial: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Clock },
  };
  const { bg, text, icon: Icon } = config[computedStatus as keyof typeof config] || config.active;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {computedStatus}
    </span>
  );
}

function ModuleToggle({ tenantId, moduleKey, name, description, enabled, icon: Icon }: any) {
  return (
    <form action={async () => {
      'use server';
      await ensureSuperAdmin();
      const db = getControlDb();
      const tenant = await db.tenant.findUnique({
        where: { id: tenantId },
      });
      if (tenant) {
        const modules = (tenant.enabledModules as Record<string, boolean>) || {};
        modules[moduleKey] = !enabled;
        await db.tenant.update({
          where: { id: tenantId },
          data: { enabledModules: modules },
        });
        revalidatePath(`/system/tenants/${tenant.slug}`);
      }
    }}>
      <button
        type="submit"
        className={`w-full text-left p-3 rounded-lg border transition-all ${
          enabled
            ? 'border-blue-500/30 bg-blue-500/5'
            : 'border-gray-700 bg-gray-900/30 hover:bg-gray-700/30'
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${enabled ? 'text-blue-400' : 'text-gray-500'}`} />
            <div>
              <div className={`text-xs font-bold ${enabled ? 'text-white' : 'text-gray-400'}`}>
                {name}
              </div>
              <div className="text-[9px] text-gray-500">{description}</div>
            </div>
          </div>
          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
            enabled ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
          }`}>
            {enabled && <CheckCircle className="h-3 w-3 text-white" />}
          </div>
        </div>
      </button>
    </form>
  );
}

async function DevicesList() {
  const db = getControlDb();
  const devices = await db.syncNode.findMany({
    orderBy: { lastHeartbeat: 'desc' },
    take: 10,
  });

  if (devices.length === 0) {
    return <p className="text-gray-500 text-sm">No devices connected</p>;
  }

  return (
    <div className="space-y-3">
      {devices.map((device: any) => (
        <div key={device.id} className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${device.status === 'HEALTHY' ? 'bg-green-400' : 'bg-red-400'}`} />
            <div>
              <p className="text-white text-sm font-medium">{device.nodeName}</p>
              <p className="text-gray-500 text-xs">{device.nodeType} • v{device.version}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium ${device.status === 'HEALTHY' ? 'text-green-400' : 'text-red-400'}`}>
              {device.status}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(device.lastHeartbeat).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
