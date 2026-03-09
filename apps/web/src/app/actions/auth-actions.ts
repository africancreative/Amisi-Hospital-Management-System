'use server';

import { cookies } from 'next/headers';
import { getControlDb, getTenantDb, TenantClient } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function loginHospitalUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const tenantSlug = formData.get('tenantSlug') as string;

    if (!email || !password || !tenantSlug) {
        throw new Error('Missing credentials or hospital ID');
    }

    // 1. Resolve Tenant
    const controlDb = getControlDb();
    const tenant = await controlDb.tenant.findUnique({
        where: { slug: tenantSlug }
    });

    if (!tenant) throw new Error('Hospital not found');

    // 2. Connect to Tenant DB
    const tenantDb = await getTenantDb(tenant.id);
    const user = await tenantDb.employee.findUnique({
        where: { email }
    });

    if (!user || user.passwordHash !== password) { // In prod, use bcrypt.compare
        throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
        throw new Error('Account is not active');
    }

    // 3. Set Session Cookies
    const cookieStore = await cookies();
    cookieStore.set('amisi-tenant-id', tenant.id, { path: '/' });
    cookieStore.set('amisi-user-role', user.role, { path: '/' });
    cookieStore.set('amisi-user-name', `${user.firstName} ${user.lastName}`, { path: '/' });

    redirect('/');
}

export async function loginSystemAdmin(formData: FormData) {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string)?.trim();

    if (!email || !password) {
        throw new Error('Missing email or password');
    }

    const controlDb = getControlDb();
    const admin = await controlDb.systemAdmin.findUnique({
        where: { email }
    });

    if (!admin) {
        throw new Error(`Admin not found with email: ${email}`);
    }

    if (admin.passwordHash !== password) {
        throw new Error('Invalid password for system administrator');
    }

    const cookieStore = await cookies();
    cookieStore.set('amisi-user-role', 'ADMIN', { path: '/' });
    cookieStore.set('amisi-user-name', admin.name, { path: '/' });
    cookieStore.set('amisi-is-system-admin', 'true', { path: '/' });

    redirect('/');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('amisi-tenant-id');
    cookieStore.delete('amisi-user-role');
    cookieStore.delete('amisi-user-name');
    cookieStore.delete('amisi-is-system-admin');
    redirect('/login');
}
