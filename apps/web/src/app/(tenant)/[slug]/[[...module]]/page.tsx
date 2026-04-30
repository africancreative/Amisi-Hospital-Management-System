export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTenantDashboardStats } from '@/app/actions/dashboard-actions';

// Static imports to bundle all modules into a single serverless function
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

// We can also import the home dashboard component here
import { TenantDashboard } from '@/components/modules/TenantHome';

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

  switch (mainModule) {
    case 'opd':
      return <OpdModule />;
    case 'pharmacy':
      return <PharmacyModule />;
    case 'lab':
    case 'laboratory':
      return <LabModule params={{ slug }} />;
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
