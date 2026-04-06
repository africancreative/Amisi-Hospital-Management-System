import { cookies } from 'next/headers';
import { Role } from '@amisi/database';
import { Permission, hasPermission as checkPermission } from '@amisi/auth';

/**
 * Server-only utility to get the current user's role from cookies.
 * In production, this would verify a JWT or session token.
 */
export async function getServerRole(): Promise<Role> {
    const cookieStore = await cookies();
    return (cookieStore.get('amisi-user-role')?.value as Role) || 'DOCTOR'; // Default to lowest priv for safety or specific default
}

/**
 * Verify if the current user has the required permission.
 * Throws an error if not authorized.
 */
export async function ensurePermission(permission: Permission) {
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
export async function ensureRole(allowedRoles: string[]) {
    const role = (await getServerRole()) as string;
    if (!allowedRoles.includes(role)) {
        throw new Error(`Unauthorized: Access restricted to ${allowedRoles.join(', ')}`);
    }
}

/**
 * Check if the user is a Super Admin (Platform level).
 */
export async function ensureSuperAdmin() {
    return ensureRole(['ADMIN']);
}
