#!/bin/bash
cd apps/web/src/app

mkdir -p login checkout/success lockout suspended terms privacy request

cat << 'INNER_EOF' > page.tsx
import HomePage from './_components/HomePage';
export default function Page() {
  return <HomePage />;
}
INNER_EOF

cat << 'INNER_EOF' > login/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import { getControlDb } from "@/lib/db";
import LoginPage from '../_components/LoginPage';

export default async function Page() {
    const cookieStore = await cookies();
    let tenantSlug = cookieStore.get('amisi-tenant-slug')?.value;
    const tenantId = cookieStore.get('amisi-tenant-id')?.value;
    const userRole = cookieStore.get('amisi-user-role')?.value;

    if (!tenantSlug && tenantId && userRole) {
        try {
            const controlDb = getControlDb();
            const tenant = await controlDb.tenant.findUnique({ where: { id: tenantId } });
            if (tenant) {
                tenantSlug = tenant.slug;
            }
        } catch (e) {
            // Ignore DB errors if not configured yet
        }
    }

    if (tenantSlug && userRole) {
        redirect(`/${tenantSlug}`);
    }
    return <LoginPage />;
}
INNER_EOF

cat << 'INNER_EOF' > checkout/page.tsx
import CheckoutPage from '../_components/CheckoutPage';
export default function Page() { return <CheckoutPage />; }
INNER_EOF

cat << 'INNER_EOF' > checkout/success/page.tsx
import CheckoutSuccessPage from '../../_components/CheckoutSuccessPage';
export default function Page() { return <CheckoutSuccessPage />; }
INNER_EOF

cat << 'INNER_EOF' > lockout/page.tsx
import LockoutPage from '../_components/LockoutPage';
export default function Page() { return <LockoutPage />; }
INNER_EOF

cat << 'INNER_EOF' > suspended/page.tsx
import SuspendedPage from '../_components/SuspendedPage';
export default function Page() { return <SuspendedPage />; }
INNER_EOF

cat << 'INNER_EOF' > terms/page.tsx
import TermsPage from '../_components/TermsPage';
export default function Page() { return <TermsPage />; }
INNER_EOF

cat << 'INNER_EOF' > privacy/page.tsx
import PrivacyPage from '../_components/PrivacyPage';
export default function Page() { return <PrivacyPage />; }
INNER_EOF

cat << 'INNER_EOF' > request/page.tsx
import RequestPage from '../_components/RequestPage';
export default function Page() { return <RequestPage />; }
INNER_EOF

# Delete the catch-all
rm -rf "[[...action]]"
