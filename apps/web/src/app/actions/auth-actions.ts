'use server';

import { cookies } from 'next/headers';
import { getControlDb, getTenantDb, TenantClient } from '@/lib/db';
import { redirect } from 'next/navigation';
import { verifyPassword } from '@amisimedos/auth';

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

        if (user.status?.toUpperCase() !== 'ACTIVE') {
            return { error: 'Account is not active' };
        }

        // 3. Set Session Cookies
        const cookieStore = await cookies();
        cookieStore.set('amisi-tenant-id', tenant.id, { path: '/' });
        cookieStore.set('amisi-tenant-slug', tenant.slug, { path: '/' });
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
        console.error(' [AUTH LOGIN FATAL] ', e);
        const errorMsg = e instanceof Error ? e.message : 'Unknown';
        return { error: `System Error: ${errorMsg}` };
    }

    redirect(`/${tenantSlug}`);
}

export async function loginSystemAdmin(formData: FormData): Promise<void> {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string)?.trim();

    let redirectPath: string | null = null;

    if (!email || !password) {
        console.warn('[AUTH] System Admin login attempt with missing credentials.');
        redirectPath = '/system/login?error=missing';
    } else {
        try {
            console.log(`[AUTH] Verifying System Admin: ${email}...`);
            const controlDb = getControlDb();
            const admin = await controlDb.systemAdmin.findUnique({
                where: { email }
            });

            if (!admin) {
                console.warn(`[AUTH] Admin identity not found: ${email}`);
                redirectPath = '/system/login?error=invalid';
            } else {
                console.log(`[AUTH] Admin found. Initiating secure password verification...`);
                // Using the unified verifyPassword utility from @amisimedos/auth
                const isValid = await verifyPassword(password, admin.passwordHash);
                
                if (!isValid) {
                    console.warn(`[AUTH] Invalid security token for admin: ${email}`);
                    redirectPath = '/system/login?error=invalid';
                } else {
                    console.log(`[AUTH] Authentication successful for admin: ${email}. Injecting platform session...`);
                    const cookieStore = await cookies();
                    
                    // Session attributes for Platform SuperAdmin
                    cookieStore.set('amisi-user-role', 'ADMIN', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
                    cookieStore.set('amisi-user-name', admin.name, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
                    cookieStore.set('amisi-is-system-admin', 'true', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
                    
                    console.log(`[AUTH] Platform session established for admin: ${email}. Routing to dashboard...`);
                    redirectPath = '/system/dashboard';
                }
            }
        } catch (e: any) {
            console.error(`[AUTH] Fatal System Admin authentication failure: ${e.message}`, e);
            redirectPath = `/system/login?error=system&msg=${encodeURIComponent(e.message)}`;
        }
    }

    if (redirectPath) {
        redirect(redirectPath);
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('amisi-tenant-id');
    cookieStore.delete('amisi-tenant-slug');
    cookieStore.delete('amisi-user-role');
    cookieStore.delete('amisi-user-name');
    cookieStore.delete('amisi-is-system-admin');
    redirect('/login');
}
