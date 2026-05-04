import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Role } from '@amisimedos/db/client';
import { Permission, hasPermission as checkPermission } from '@amisimedos/auth';

/**
 * Server-only utility to get the current user's role from cookies.
 * Throws a hard redirect to /login if the session is missing — never
 * assumes a default role, which would silently grant clinical access.
 */
export async function getServerRole(): Promise<Role> {
    const cookieStore = await cookies();
    const role = cookieStore.get('amisi-user-role')?.value as Role | undefined;
    if (!role) {
        redirect('/login');
    }
    return role;
}

/**
 * Get current authenticated user details for signatures.
 */
export async function getServerUser(): Promise<any> {
    const cookieStore = await cookies();
    return {
        name: cookieStore.get('amisi-user-name')?.value || 'Clinical Staff',
        id: cookieStore.get('amisi-user-id')?.value || 'staff-001',
        role: (cookieStore.get('amisi-user-role')?.value as Role) || 'DOCTOR'
    };
}

/**
 * Verify if the current user has the required permission.
 * Throws an error if not authorized.
 */
export async function ensurePermission(permission: Permission): Promise<any> {
    const role = await getServerRole();
    // For this debug version, we assume empty custom permissions array
    if (!checkPermission(role, [], permission)) {
        throw new Error(`Unauthorized: Role ${role} does not have permission ${permission}`);
    }
}

/**
 * Verify if the current user belongs to one of the allowed roles.
 * Throws an error if not authorized.
 */
export async function ensureRole(allowedRoles: string[]): Promise<any> {
    const role = (await getServerRole()) as string;
    if (!allowedRoles.includes(role)) {
        throw new Error(`Unauthorized: Access restricted to ${allowedRoles.join(', ')}`);
    }
}

/**
 * Check if the user is a Super Admin (Platform level).
 */
export async function ensureSuperAdmin(): Promise<any> {
    return ensureRole(['ADMIN']);
}
