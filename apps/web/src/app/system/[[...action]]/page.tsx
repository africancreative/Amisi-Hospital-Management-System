import { notFound, redirect } from 'next/navigation';
import { cookies } from "next/headers";
import DashboardPage from '../_components/DashboardPage';
import LoginPage from '../_components/LoginPage';
import NewHospitalPage from '../_components/NewHospitalPage';
import CreateHospitalPage from '../_components/CreateHospitalPage';
import EditHospitalPage from '../_components/EditHospitalPage';
import { SystemSettingsForm } from '@/components/system/SystemSettingsForm';
import SystemAdminLayout from '@/components/system-admin/SystemAdminLayout';
import HospitalsPage from '@/app/hospitals/_components/HospitalsPage';
import AnalyticsPage from '@/app/(system)/analytics/page';
import BillingDashboard from '@/app/(system)/billing/page';

export default async function SystemRouter(props: { params: Promise<{ action?: string[] }>, searchParams: Promise<any> }) {
  const params = await props.params;
  const action = params.action || [];

  if (action.length === 0) {
    redirect('/system/dashboard');
  }

  if (action.length === 1 && action[0] === 'login') {
    const cookieStore = await cookies();
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    if (isSystemAdmin) {
        redirect(`/system/dashboard`);
    }
    return <LoginPage searchParams={props.searchParams} params={Promise.resolve({})} />;
  }

  const cookieStore = await cookies();
  const userName = cookieStore.get('amisi-user-name')?.value || 'System Admin';
  const userRole = 'SYSTEM_ADMIN';
  
  // Need to dynamically import getPlatformAnalytics from actions to pass stats to layout
  const { getPlatformAnalytics, getPlatformDashboardStats } = await import('@/app/actions/dashboard-actions');
  const [analytics, basicStats] = await Promise.all([
    getPlatformAnalytics(),
    getPlatformDashboardStats()
  ]);
  const combinedStats = { ...analytics, ...basicStats };

  let content = null;

  if (action.length === 1 && action[0] === 'dashboard') {
    content = <DashboardPage />;
  } else if (action.length === 1 && action[0] === 'billing') {
    content = <BillingDashboard />;
  } else if (action.length === 1 && action[0] === 'analytics') {
    content = <AnalyticsPage />;
  } else if (action.length === 1 && action[0] === 'security') {
    content = (
        <div className="p-6">
          <h1 className="text-2xl font-bold">Platform Security</h1>
          <p className="text-muted-foreground mt-2">Security audits, firewall settings, and access control coming soon.</p>
        </div>
    );
  } else if (action.length === 1 && action[0] === 'settings') {
    content = <SystemSettingsForm />;
  } else if (action.length === 1 && action[0] === 'users') {
    content = (
        <div className="p-6">
          <h1 className="text-2xl font-bold">System Users</h1>
          <p className="text-muted-foreground mt-2">User management coming soon.</p>
        </div>
    );
  } else if (action.length === 1 && action[0] === 'tenants') {
    content = <HospitalsPage />;
  } else if (action.length === 2 && action[0] === 'tenants' && action[1] === 'new') {
    content = <NewHospitalPage />;
  } else if (action.length === 2 && action[0] === 'tenants' && action[1] !== 'new') {
    const { default: TenantDetailPage } = await import('@/app/tenants/[slug]/page');
    content = <TenantDetailPage params={Promise.resolve({ slug: action[1] })} />;
  } else if (action.length === 3 && action[0] === 'tenants' && action[2] === 'edit') {
    content = <EditHospitalPage params={Promise.resolve({ id: action[1] })} />;
  } else if (action.length === 2 && action[0] === 'hospitals' && action[1] === 'new') {
    content = <NewHospitalPage />;
  } else if (action.length === 2 && action[0] === 'hospitals' && action[1] === 'create') {
    content = <CreateHospitalPage />;
  } else if (action.length === 3 && action[0] === 'hospitals' && action[2] === 'edit') {
    content = <EditHospitalPage params={Promise.resolve({ id: action[1] })} />;
  } else if (action[0] === 'content') {
    const { LandingContentCMS } = await import('../_components/LandingContentCMS');
    content = <LandingContentCMS />;
  } else if (action[0] === 'web') {
    const { WebAdminDashboard } = await import('../_components/WebAdminDashboard');
    content = <WebAdminDashboard feature={action[1] || 'dashboard'} />;
  } else if (action[0] === 'crm') {
    const { CRMDashboard } = await import('../_components/CRMDashboard');
    content = <CRMDashboard feature={action[1] || 'dashboard'} />;
  } else {
    notFound();
  }

  return (
    <SystemAdminLayout userName={userName} userRole={userRole} stats={combinedStats}>
      {content}
    </SystemAdminLayout>
  );
}
