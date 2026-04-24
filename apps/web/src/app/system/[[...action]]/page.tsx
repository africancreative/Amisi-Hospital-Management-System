import { notFound, redirect } from 'next/navigation';
import { cookies } from "next/headers";
import DashboardPage from '../_components/DashboardPage';
import LoginPage from '../_components/LoginPage';
import NewHospitalPage from '../_components/NewHospitalPage';
import CreateHospitalPage from '../_components/CreateHospitalPage';
import EditHospitalPage from '../_components/EditHospitalPage';

export default async function SystemRouter(props: { params: Promise<{ action?: string[] }>, searchParams: Promise<any> }) {
  const params = await props.params;
  const action = params.action || [];

  if (action.length === 0) {
    redirect('/system/dashboard');
  }

  if (action.length === 1 && action[0] === 'dashboard') {
    return <DashboardPage searchParams={props.searchParams} />;
  }

  if (action.length === 1 && action[0] === 'login') {
    const cookieStore = await cookies();
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    if (isSystemAdmin) {
        redirect(`/system/dashboard`);
    }
    return <LoginPage searchParams={props.searchParams} params={Promise.resolve({})} />;
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
