'use server';

import { cookies } from 'next/headers';
import { getControlDb, getTenantDb, TenantClient } from '@/lib/db';
import { redirect } from 'next/navigation';
import { verifyPassword } from '@amisi/auth';

import { logAudit } from '@/lib/audit';

export interface AuthActionState {
    success?: boolean;
    error?: string | null;
}

export async function loginHospitalUser(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string)?.trim();
    const tenantSlug = (formData.get('tenantSlug') as string)?.trim().toLowerCase();

    if (!email || !password || !tenantSlug) {
        return { error: 'Missing credentials or hospital ID' };
    }

    try {
        // 1. Resolve Tenant
        const controlDb = getControlDb();
        const tenant = await controlDb.tenant.findUnique({
            where: { slug: tenantSlug }
        });

        if (!tenant) return { error: 'Hospital not found' };

        // 2. Connect to Tenant DB
        const tenantDb = await getTenantDb(tenant.id);
        const user = await tenantDb.employee.findUnique({
            where: { email }
        });

        if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) { 
            return { error: 'Invalid email or password' };
        }

        if (user.status !== 'active') {
            return { error: 'Account is not active' };
        }

        // 3. Set Session Cookies
        const cookieStore = await cookies();
        cookieStore.set('amisi-tenant-id', tenant.id, { path: '/' });
        cookieStore.set('amisi-user-id', user.id, { path: '/' });
        cookieStore.set('amisi-user-role', user.role, { path: '/' });
        cookieStore.set('amisi-user-name', `${user.firstName} ${user.lastName}`, { path: '/' });

        // 4. HIPAA Audit Log
        await logAudit({
            action: 'LOGIN',
            resource: 'User',
            resourceId: user.id,
            details: { email, tenant: tenantSlug }
        });
    } catch (e) {
        console.error('Login error:', e);
        return { error: 'An unexpected system error occurred' };
    }

    redirect(`/${tenantSlug}`);
}

export async function loginSystemAdmin(formData: FormData): Promise<void> {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string)?.trim();

    let redirectPath: string | null = null;

    if (!email || !password) {
        redirectPath = '/system/login?error=missing';
    } else {
        try {
            console.log(`[LOGIN] Attempting System Admin login for: ${email}`);
            const controlDb = getControlDb();
            const admin = await controlDb.systemAdmin.findUnique({
                where: { email }
            });

            if (!admin) {
                console.warn(`[LOGIN] Admin not found for email: ${email}`);
                redirectPath = '/system/login?error=invalid';
            } else if (!admin.passwordHash) {
                console.error(`[LOGIN] Admin found but passwordHash is missing for: ${email}`);
                redirectPath = '/system/login?error=invalid';
            } else {
                console.log(`[LOGIN] Admin found. Verifying password...`);
                const isValid = await verifyPassword(password, admin.passwordHash);
                console.log(`[LOGIN] Password verification result: ${isValid}`);
                
                if (!isValid) {
                    redirectPath = '/system/login?error=invalid';
                } else {
                    const cookieStore = await cookies();
                    cookieStore.set('amisi-user-role', 'ADMIN', { path: '/' });
                    cookieStore.set('amisi-user-name', admin.name, { path: '/' });
                    cookieStore.set('amisi-is-system-admin', 'true', { path: '/' });
                    console.log(`[LOGIN] Login successful for: ${email}`);
                    redirectPath = '/system/dashboard';
                }
            }
        } catch (e) {
            console.error('[LOGIN] Admin login error:', e);
            redirectPath = '/system/login?error=system';
        }
    }

    if (redirectPath) {
        redirect(redirectPath);
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('amisi-tenant-id');
    cookieStore.delete('amisi-user-role');
    cookieStore.delete('amisi-user-name');
    cookieStore.delete('amisi-is-system-admin');
    redirect('/login');
}
