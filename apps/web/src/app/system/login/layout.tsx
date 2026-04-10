import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SystemLoginLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    if (isSystemAdmin) {
        redirect(`/system/dashboard`);
    }

    return <>{children}</>;
}
