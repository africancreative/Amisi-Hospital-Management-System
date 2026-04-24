import { notFound, redirect } from 'next/navigation';
import { cookies } from "next/headers";
import { getControlDb } from "@/lib/db";
import HomePage from '../_components/HomePage';
import LoginPage from '../_components/LoginPage';
import CheckoutPage from '../_components/CheckoutPage';
import CheckoutSuccessPage from '../_components/CheckoutSuccessPage';
import LockoutPage from '../_components/LockoutPage';
import SuspendedPage from '../_components/SuspendedPage';
import PricingPage from '../_components/PricingPage';
import TermsPage from '../_components/TermsPage';
import PrivacyPage from '../_components/PrivacyPage';
import RequestPage from '../_components/RequestPage';

export default async function RootRouter(props: { params: Promise<{ action?: string[] }>, searchParams: Promise<any> }) {
  const params = await props.params;
  const action = params.action || [];

  if (action.length === 0) {
    return <HomePage />;
  }

  if (action.length === 1) {
    if (action[0] === 'login') {
        const cookieStore = await cookies();
        let tenantSlug = cookieStore.get('amisi-tenant-slug')?.value;
        const tenantId = cookieStore.get('amisi-tenant-id')?.value;
        const userRole = cookieStore.get('amisi-user-role')?.value;

        if (!tenantSlug && tenantId && userRole) {
            const controlDb = getControlDb();
            const tenant = await controlDb.tenant.findUnique({ where: { id: tenantId } });
            if (tenant) {
                tenantSlug = tenant.slug;
            }
        }

        if (tenantSlug && userRole) {
            redirect(`/${tenantSlug}`);
        }
        return <LoginPage />;
    }

    switch (action[0]) {
      case 'checkout': return <CheckoutPage />;
      case 'lockout': return <LockoutPage />;
      case 'suspended': return <SuspendedPage />;
      case 'pricing': return <PricingPage />;
      case 'terms': return <TermsPage />;
      case 'privacy': return <PrivacyPage />;
      case 'request': return <RequestPage />;
    }
  }

  if (action.length === 2 && action[0] === 'checkout' && action[1] === 'success') {
    return <CheckoutSuccessPage />;
  }

  notFound();
}
