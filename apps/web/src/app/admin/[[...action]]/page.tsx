import { notFound, redirect } from 'next/navigation';
import AnalyticsPage from '../_components/AnalyticsPage';
import SecurityPage from '../_components/SecurityPage';
import HospitalsPage from '../_components/HospitalsPage';
import OnboardHospitalPage from '../_components/OnboardHospitalPage';
import HospitalModulesPage from '../_components/HospitalModulesPage';

export default async function AdminRouter(props: { params: Promise<{ action?: string[] }>, searchParams: Promise<any> }) {
  const params = await props.params;
  const action = params.action || [];

  if (action.length === 0) {
    redirect('/admin/analytics');
  }

  if (action.length === 1 && action[0] === 'analytics') {
    return <AnalyticsPage />;
  }

  if (action.length === 1 && action[0] === 'security') {
    return <SecurityPage />;
  }

  if (action.length === 1 && action[0] === 'hospitals') {
    return <HospitalsPage />;
  }

  if (action.length === 2 && action[0] === 'hospitals' && action[1] === 'onboard') {
    return <OnboardHospitalPage />;
  }

  if (action.length === 3 && action[0] === 'hospitals' && action[2] === 'modules') {
    return <HospitalModulesPage />;
  }

  notFound();
}
