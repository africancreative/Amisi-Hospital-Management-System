import { getServerRole } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'STAFF';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Role[];
    slug: string;
}

/**
 * Server Component to guard department routes based on user role.
 */
export default async function RoleGuard({ children, allowedRoles, slug }: RoleGuardProps) {
    const userRole = await getServerRole();

    if (!allowedRoles.includes(userRole)) {
        // Redirect to specialized lockout or simple unauthorized page
        redirect(`/${slug}/unauthorized?required=${allowedRoles.join(',')}`);
    }

    return <>{children}</>;
}
