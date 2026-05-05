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

  if (action.length === 1 && action[0] === 'dashboard') {
    return <DashboardPage searchParams={props.searchParams} />;
  }

  if (action.length === 1 && action[0] === 'billing') {
    return <BillingDashboard />;
  }

  if (action.length === 1 && action[0] === 'analytics') {
    return <AnalyticsPage />;
  }

  if (action.length === 1 && action[0] === 'login') {
    const cookieStore = await cookies();
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    if (isSystemAdmin) {
        redirect(`/system/dashboard`);
    }
    return <LoginPage searchParams={props.searchParams} params={Promise.resolve({})} />;
  }

  if (action.length === 1 && action[0] === 'settings') {
    const cookieStore = await cookies();
    const userName = cookieStore.get('amisi-user-name')?.value || 'System Admin';
    const userRole = 'SYSTEM_ADMIN';

    return (
      <SystemAdminLayout userName={userName} userRole={userRole}>
        <SystemSettingsForm />
      </SystemAdminLayout>
    );
  }

  if (action.length === 1 && action[0] === 'users') {
    const cookieStore = await cookies();
    const userName = cookieStore.get('amisi-user-name')?.value || 'System Admin';
    const userRole = 'SYSTEM_ADMIN';

    return (
      <SystemAdminLayout userName={userName} userRole={userRole}>
        <div className="p-6">
          <h1 className="text-2xl font-bold">System Users</h1>
          <p className="text-muted-foreground mt-2">User management coming soon.</p>
        </div>
      </SystemAdminLayout>
    );
  }

  if (action.length === 1 && action[0] === 'tenants') {
    return <HospitalsPage />;
  }

  if (action.length === 2 && action[0] === 'tenants' && action[1] === 'new') {
    return <NewHospitalPage />;
  }

  if (action.length === 2 && action[0] === 'tenants' && action[1] !== 'new') {
    // Tenant detail page: /system/tenants/[slug]
    const { default: TenantDetailPage } = await import('@/app/tenants/[slug]/page');
    return <TenantDetailPage params={Promise.resolve({ slug: action[1] })} />;
  }

  if (action.length === 3 && action[0] === 'tenants' && action[2] === 'edit') {
    // Tenant edit page: /system/tenants/[slug]/edit
    return <EditHospitalPage params={Promise.resolve({ id: action[1] })} />;
  }

  if (action.length === 2 && action[0] === 'hospitals' && action[1] === 'new') {
    return <NewHospitalPage />;
  }

  if (action.length === 2 && action[0] === 'hospitals' && action[1] === 'create') {
    return <CreateHospitalPage />;
  }

  if (action.length === 3 && action[0] === 'hospitals' && action[2] === 'edit') {
    // Pass the params exactly as Next.js would have passed them to the dynamic route
    return <EditHospitalPage params={Promise.resolve({ id: action[1] })} />;
  }

  notFound();
}
