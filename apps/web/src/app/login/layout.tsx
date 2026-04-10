import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getControlDb } from "@/lib/db";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
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

    return <>{children}</>;
}
