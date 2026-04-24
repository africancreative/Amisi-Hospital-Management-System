import { notFound } from 'next/navigation';
import HospitalsPage from '../_components/HospitalsPage';
import NewHospitalPage from '../_components/NewHospitalPage';
import HospitalDetailsPage from '../_components/HospitalDetailsPage';

export default async function HospitalsRouter(props: { params: Promise<{ action?: string[] }>, searchParams: Promise<any> }) {
  const params = await props.params;
  const action = params.action || [];

  if (action.length === 0) {
    return <HospitalsPage />;
  }

  if (action.length === 1 && action[0] === 'new') {
    return <NewHospitalPage />;
  }

  if (action.length === 1 && action[0] !== 'new') {
    return <HospitalDetailsPage params={Promise.resolve({ id: action[0] })} searchParams={props.searchParams} />;
  }

  notFound();
}
