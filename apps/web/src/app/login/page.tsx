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
