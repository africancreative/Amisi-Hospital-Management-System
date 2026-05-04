export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTenantDashboardStats } from '@/app/actions/dashboard-actions';

// Import the Client Dispatcher
import ModuleClientDispatcher from '@/components/modules/ModuleClientDispatcher';

// Static Imports for Server Components
import OpdModule from '@/components/modules/OpdModule';
import PharmacyModule from '@/components/modules/PharmacyModule';
import LabModule from '@/components/modules/LabModule';
import BillingModule from '@/components/modules/BillingModule';
import BillingDetailsModule from '@/components/modules/BillingDetailsModule';
import WardModule from '@/components/modules/WardModule';
import PatientsModule from '@/components/modules/PatientsModule';
import HrModule from '@/components/modules/HrModule';
import EdModule from '@/components/modules/EdModule';
import DashboardModule from '@/components/modules/DashboardModule';
import SettingsModule from '@/components/modules/SettingsModule';
import InventoryModule from '@/components/modules/InventoryModule';
import UsersModule from '@/components/modules/UsersModule';
import AccountingModule from '@/components/modules/AccountingModule';
import RadiologyModule from '@/components/modules/RadiologyModule';
import SubscriptionModule from '@/components/modules/SubscriptionModule';
import { TenantDashboard } from '@/components/modules/TenantHome';
import { getStaffDashboardOverview } from '@/lib/staff-tracking-actions';

interface ModulePageProps {
  params: Promise<{
    slug: string;
    module?: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ModuleDispatcher({ params: paramsPromise, searchParams: searchParamsPromise }: ModulePageProps) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const { slug, module } = params;

  const cookieStore = await cookies();
  const userRole = cookieStore.get('amisi-user-role')?.value;

  if (!userRole) {
    redirect('/login');
  }

  // Handle /[slug] (Home)
  if (!module || module.length === 0) {
    const stats = await getTenantDashboardStats();
    return <TenantDashboard stats={stats} slug={slug} userRole={userRole} />;
  }

  const mainModule = module[0];
  const subPath = module.slice(1);

  // Check if it's a Client-Side High-Fidelity Dashboard
  const clientModules = [
    'doctor', 'lab', 'laboratory', 'triage', 
    'pharmacy-on-duty', 'ward-on-duty', 'inventory-on-duty', 
    'finance-on-duty', 'billing-on-duty', 'chat',
    'hr-performance', 'hr-activity'
  ];

  if (clientModules.includes(mainModule)) {
    return <ModuleClientDispatcher mainModule={mainModule} subPath={subPath} slug={slug} />;
  }

  // Handle HR sub-routes (performance, activity)
  if (mainModule === 'hr') {
    if (subPath.length >= 1) {
      if (subPath[0] === 'performance') {
        const overview = await getStaffDashboardOverview();
        return <ModuleClientDispatcher mainModule="hr-performance" subPath={subPath} slug={slug} initialOverview={overview} />;
      }
      if (subPath[0] === 'activity') {
        return <ModuleClientDispatcher mainModule="hr-activity" subPath={subPath} slug={slug} />;
      }
    }
    return <HrModule params={{ slug }} />;
  }

  // Handle specialized Server/Client mix (EMR)
  if (mainModule === 'emr') {
    if (subPath.length === 1) return <ModuleClientDispatcher mainModule="emr" subPath={subPath} slug={slug} />;
    return <PatientsModule params={{ slug }} searchParams={searchParams as any} />;
  }

  // Legacy / Fallback Server Modules
  switch (mainModule) {
    case 'opd':
      return <OpdModule />;
    case 'pharmacy':
      return <PharmacyModule />;
    case 'billing':
      if (subPath.length === 1) return <BillingDetailsModule id={subPath[0]} />;
      return <BillingModule />;
    case 'wards':
    case 'ipd':
    case 'nursing':
      return <WardModule />;
    case 'patients':
      return <PatientsModule params={{ slug }} searchParams={searchParams as any} />;
    case 'hr':
      return <HrModule params={{ slug }} />;
    case 'ed':
    case 'er':
    case 'emergency':
      return <EdModule />;
    case 'dashboard':
      return <DashboardModule />;
    case 'settings':
    case 'config':
      return <SettingsModule params={{ slug }} />;
    case 'inventory':
    case 'stock':
      return <InventoryModule />;
    case 'users':
    case 'staff':
      return <UsersModule params={{ slug }} />;
    case 'accounting':
    case 'finance':
      return <AccountingModule params={{ slug }} />;
    case 'radiology':
    case 'imaging':
    case 'diagnostics':
      return <RadiologyModule />;
    case 'subscription':
    case 'billing-plan':
    case 'license':
      return <SubscriptionModule params={{ slug }} />;
    default:
      notFound();
  }
}
