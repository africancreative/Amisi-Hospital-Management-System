'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Puzzle,
  Check,
  X,
  Link2,
  AlertTriangle,
  Save,
  RotateCcw,
  Search,
  ChevronDown,
  Info,
  Beaker,
  Pill,
  FileText,
  Package,
  Heart,
  Stethoscope,
  Shield,
  Activity,
  Loader2,
} from 'lucide-react';
import { ModuleCard } from '@/components/system-admin/ModuleCard';
import { DependencyMap } from '@/components/system-admin/DependencyMap';
import { getTenants, updateEnabledModules } from '@/app/actions/core-actions';

// Module definitions with dependencies
interface ModuleConfig {
  code: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  dependencies: string[];
  enabled: boolean;
  category: 'core' | 'clinical' | 'financial' | 'operational';
}

const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    code: 'MOD-EMR',
    name: 'EMR',
    description: 'Electronic Medical Records - core patient data management',
    icon: <FileText className="w-5 h-5" />,
    dependencies: [],
    enabled: true,
    category: 'core',
  },
  {
    code: 'MOD-PH',
    name: 'Pharmacy',
    description: 'Pharmacy management, prescriptions, and inventory',
    icon: <Pill className="w-5 h-5" />,
    dependencies: ['MOD-EMR'],
    enabled: true,
    category: 'clinical',
  },
  {
    code: 'MOD-LD',
    name: 'Lab',
    description: 'Laboratory order management and results tracking',
    icon: <Beaker className="w-5 h-5" />,
    dependencies: ['MOD-EMR'],
    enabled: true,
    category: 'clinical',
  },
  {
    code: 'MOD-BR',
    name: 'Billing',
    description: 'Revenue cycle, invoicing, and payment processing',
    icon: <FileText className="w-5 h-5" />,
    dependencies: ['MOD-EMR'],
    enabled: true,
    category: 'financial',
  },
  {
    code: 'MOD-IS',
    name: 'Inventory',
    description: 'Medical supplies and equipment tracking',
    icon: <Package className="w-5 h-5" />,
    dependencies: [],
    enabled: false,
    category: 'operational',
  },
  {
    code: 'MOD-WD',
    name: 'Ward Management',
    description: 'Bed management, admissions, and transfers',
    icon: <Heart className="w-5 h-5" />,
    dependencies: ['MOD-EMR'],
    enabled: true,
    category: 'operational',
  },
  {
    code: 'MOD-RT',
    name: 'Radiology',
    description: 'Imaging orders, scheduling, and report management',
    icon: <Activity className="w-5 h-5" />,
    dependencies: ['MOD-EMR'],
    enabled: false,
    category: 'clinical',
  },
  {
    code: 'MOD-IC',
    name: 'ICU Module',
    description: 'ICU-specific workflows, vitals monitoring, and scoring',
    icon: <Stethoscope className="w-5 h-5" />,
    dependencies: ['MOD-EMR', 'MOD-WD'],
    enabled: false,
    category: 'clinical',
  },
  {
    code: 'MOD-HR',
    name: 'HR Management',
    description: 'Staff scheduling, payroll, and credential tracking',
    icon: <Shield className="w-5 h-5" />,
    dependencies: [],
    enabled: false,
    category: 'operational',
  },
];

export default function ModulesPage() {
  const [modules, setModules] = useState<ModuleConfig[]>(AVAILABLE_MODULES);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDependencyMap, setShowDependencyMap] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTenants();
        setTenants(data);
        if (data.length > 0) {
          setSelectedTenant(data[0].id);
          loadTenantModules(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const loadTenantModules = (tenant: any) => {
    if (!tenant.enabledModules) return;
    const enabledModules = tenant.enabledModules as Record<string, boolean>;
    setModules(prev => prev.map(m => ({
      ...m,
      enabled: !!enabledModules[m.code.toLowerCase()] || m.enabled
    })));
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenant(tenantId);
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) loadTenantModules(tenant);
  };

  const tenantOptions = [
    { id: 'city-general', name: 'City General Hospital' },
    { id: 'sunset-clinic', name: 'Sunset Family Clinic' },
    { id: 'metro-lab', name: 'Metro Lab Services' },
  ];

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const modulesByCategory = filteredModules.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, ModuleConfig[]>);

  const categoryLabels: Record<string, string> = {
    core: 'Core Modules',
    clinical: 'Clinical Modules',
    financial: 'Financial Modules',
    operational: 'Operational Modules',
  };

  // Validation logic
  const validateDependencies = useCallback((updatedModules: ModuleConfig[]): string[] => {
    const errors: string[] = [];
    const enabledCodes = new Set(updatedModules.filter(m => m.enabled).map(m => m.code));

    for (const mod of updatedModules) {
      if (mod.enabled) {
        for (const dep of mod.dependencies) {
          if (!enabledCodes.has(dep)) {
            const depName = updatedModules.find(m => m.code === dep)?.name || dep;
            errors.push(`${mod.name} requires ${depName} to be enabled`);
          }
        }
      }
    }
    return errors;
  }, []);

  const handleToggleModule = (code: string) => {
    const updatedModules = modules.map(m =>
      m.code === code ? { ...m, enabled: !m.enabled } : m
    );

    // If disabling, also disable dependent modules
    if (modules.find(m => m.code === code)?.enabled) {
      const disabledModule = modules.find(m => m.code === code)!;
      for (const mod of updatedModules) {
        if (mod.dependencies.includes(code)) {
          mod.enabled = false;
        }
      }
    }

    const errors = validateDependencies(updatedModules);
    setValidationErrors(errors);
    setModules(updatedModules);
    setHasChanges(true);
  };

  const handleBulkEnable = (category: string) => {
    const updatedModules = modules.map(m =>
      m.category === category ? { ...m, enabled: true } : m
    );
    const errors = validateDependencies(updatedModules);
    setValidationErrors(errors);
    setModules(updatedModules);
    setHasChanges(true);
  };

  const handleBulkDisable = (category: string) => {
    const updatedModules = modules.map(m =>
      m.category === category ? { ...m, enabled: false } : m
    );
    const errors = validateDependencies(updatedModules);
    setValidationErrors(errors);
    setModules(updatedModules);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedTenant) return;
    const errors = validateDependencies(modules);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const modulesConfig = modules.reduce((acc, mod) => {
        acc[mod.code.toLowerCase()] = mod.enabled;
        return acc;
      }, {} as Record<string, boolean>);

      await updateEnabledModules(selectedTenant, modulesConfig);
      setHasChanges(false);
    } catch (error: any) {
      setValidationErrors([error.message || 'Failed to save']);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const tenant = tenants.find(t => t.id === selectedTenant);
    if (tenant) loadTenantModules(tenant);
    setValidationErrors([]);
    setHasChanges(false);
  };

  const enabledCount = modules.filter(m => m.enabled).length;
  const totalCount = modules.length;

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
          <h1 className="text-gray-100 text-xl font-semibold">Module Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Enable/disable modules per tenant</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tenant Selector & Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-gray-500 text-xs mb-1.5">Select Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600"
            >
              {tenantOptions.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-gray-500 text-xs">Enabled</p>
              <p className="text-gray-200 text-lg font-semibold">{enabledCount}/{totalCount}</p>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <button
              onClick={() => setShowDependencyMap(!showDependencyMap)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                showDependencyMap
                  ? 'border-blue-600 text-blue-400 bg-blue-600/10'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Dependency Map
            </button>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">Dependency Validation Failed</p>
              <ul className="mt-2 space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-red-300 text-xs flex items-center gap-1.5">
                    <X className="w-3 h-3" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Map */}
      {showDependencyMap && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-gray-300 text-sm font-medium mb-4">Module Dependencies</h3>
          <DependencyMap modules={modules} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 text-sm focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Categories</option>
          <option value="core">Core</option>
          <option value="clinical">Clinical</option>
          <option value="financial">Financial</option>
          <option value="operational">Operational</option>
        </select>
      </div>

      {/* Module Grid by Category */}
      <div className="space-y-6">
        {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
          <div key={category}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                {categoryLabels[category] || category}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkEnable(category)}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-600/10 transition-colors"
                >
                  Enable All
                </button>
                <span className="text-gray-700">|</span>
                <button
                  onClick={() => handleBulkDisable(category)}
                  className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                >
                  Disable All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryModules.map((mod) => (
                <ModuleCard
                  key={mod.code}
                  module={mod}
                  onToggle={() => handleToggleModule(mod.code)}
                  dependencyNames={mod.dependencies.map(
                    depCode => modules.find(m => m.code === depCode)?.name || depCode
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
