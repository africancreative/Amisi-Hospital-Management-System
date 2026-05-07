'use server';

import { cookies } from 'next/headers';
import { getControlDb, getTenantDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import { verifyPassword, hashPassword } from '@amisimedos/auth';
import { logAudit } from '@/lib/audit';
import { ensureRole, ensureSuperAdmin } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { Decimal, Role, DeploymentTier } from '@amisimedos/db/client';
import type { Module, Tenant } from '@amisimedos/db/types';
import path from "path";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// ─── AUTH ACTIONS ────────────────────────────────────────────────────────────

export interface AuthActionState {
    success?: boolean;
    error?: string | null;
}

export async function loginHospitalUser(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string)?.trim();
    const tenantSlug = (formData.get('tenantSlug') as string)?.trim().toLowerCase();

    if (!email || !password || !tenantSlug) return { error: 'Missing credentials or hospital ID' };

    try {
        const controlDb = getControlDb();
        const tenant = await controlDb.tenant.findUnique({ where: { slug: tenantSlug } });
        if (!tenant) return { error: 'Hospital not found' };

        const tenantDb = await getTenantDb(tenant.id);
        const user = await tenantDb.employee.findUnique({ where: { email } });

        if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) { 
            return { error: 'Invalid email or password' };
        }

        if (user.status?.toUpperCase() !== 'ACTIVE') return { error: 'Account is not active' };

        const cookieStore = await cookies();
        cookieStore.set('amisi-tenant-id', tenant.id, { path: '/' });
        cookieStore.set('amisi-tenant-slug', tenant.slug, { path: '/' });
        cookieStore.set('amisi-user-id', user.id, { path: '/' });
        cookieStore.set('amisi-user-role', user.role, { path: '/' });
        cookieStore.set('amisi-user-name', `${user.firstName} ${user.lastName}`, { path: '/' });

        await logAudit({ action: 'LOGIN', resource: 'User', resourceId: user.id, details: { email, tenant: tenantSlug } });
    } catch (e) {
        return { error: `System Error: ${e instanceof Error ? e.message : 'Unknown'}` };
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
            const controlDb = getControlDb();
            const admin = await controlDb.systemAdmin.findUnique({ where: { email } });
            if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
                redirectPath = '/system/login?error=invalid';
            } else {
                const cookieStore = await cookies();
                cookieStore.set('amisi-user-role', 'ADMIN', { path: '/', httpOnly: true });
                cookieStore.set('amisi-user-name', admin.name, { path: '/', httpOnly: true });
                cookieStore.set('amisi-is-system-admin', 'true', { path: '/', httpOnly: true });
                redirectPath = '/system/dashboard';
            }
        } catch (e: any) {
            redirectPath = `/system/login?error=system&msg=${encodeURIComponent(e.message)}`;
        }
    }
    if (redirectPath) redirect(redirectPath);
}

export async function logout(): Promise<any> {
    const cookieStore = await cookies();
    ['amisi-tenant-id','amisi-tenant-slug','amisi-user-role','amisi-user-name','amisi-is-system-admin'].forEach(k => cookieStore.delete(k));
    redirect('/login');
}

// ─── USER ACTIONS ────────────────────────────────────────────────────────────

export async function getEmployees(): Promise<any> {
    await ensureRole(['ADMIN']);
    const db = await getTenantDb();
    return db.employee.findMany({ orderBy: [{ role: 'asc' }, { lastName: 'asc' }] });
}

export async function addEmployee(data: { employeeId: string; firstName: string; lastName: string; email: string; role: Role; department: string; baseSalary: number; }): Promise<any> {
    await ensureRole(['ADMIN']);
    const db = await getTenantDb();
    const employee = await db.employee.create({
        data: { ...data, baseSalary: new Decimal(data.baseSalary), passwordHash: '@Amisi123', status: 'active' }
    });
    revalidatePath('/users');
    return employee;
}

export async function removeEmployee(id: string): Promise<any> {
    await ensureRole(['ADMIN']);
    const db = await getTenantDb();
    const employee = await db.employee.update({ where: { id }, data: { status: 'inactive' } });
    revalidatePath('/users');
    return employee;
}

// ─── SYSTEM & TENANT ACTIONS ─────────────────────────────────────────────────

export async function fetchModules(): Promise<Module[]> {
    await ensureSuperAdmin();
    return getControlDb().module.findMany({ orderBy: { name: 'asc' } });
}

export async function getGlobalSettings(): Promise<any> {
    try {
        const db = getControlDb();
        let settings = await db.globalSettings.findUnique({ where: { id: 'singleton' } });
        if (!settings) settings = await db.globalSettings.create({ data: { id: 'singleton', platformName: 'AmisiMedOS', showHero: true } });
        return settings;
    } catch (err: any) {
        return { platformName: 'AmisiMedOS', platformSlogan: 'Next-Generation Healthcare Networking', showHero: true };
    }
}

export async function updateGlobalSettings(data: any): Promise<any> {
    await ensureSuperAdmin();
    const { id, updatedAt, ...cleanData } = data;
    await getControlDb().globalSettings.upsert({ where: { id: 'singleton' }, update: cleanData, create: { id: 'singleton', ...cleanData } });
    revalidatePath('/system/dashboard');
}

export async function createTenant(formData: FormData): Promise<any> {
    await ensureSuperAdmin();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const region = formData.get('region') as string;
    const adminEmail = formData.get('adminEmail') as string;
    const adminPassword = formData.get('adminPassword') as string;

    const { createTenantDatabase, provisionTenant } = await import('@amisimedos/db/management' as any);
    const { dbUrl } = await createTenantDatabase(slug);
    const passwordHash = await hashPassword(adminPassword);

    await provisionTenant(name, slug, region, dbUrl, 'CLINIC', {}, {}, { name: formData.get('adminName') as string, email: adminEmail, passwordHash });
    revalidatePath('/hospitals');
}

export async function updateTenantStatus(id: string, status: 'active' | 'suspended' | 'terminated'): Promise<any> {
    await ensureSuperAdmin();
    await getControlDb().tenant.update({ where: { id }, data: { status } });
    revalidatePath('/hospitals');
}

// ─── UPLOAD ACTIONS ──────────────────────────────────────────────────────────

export async function uploadFile(formData: FormData): Promise<{ url: string }> {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuidv4()}${path.extname(file.name)}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await writeFile(path.join(uploadDir, filename), buffer);
    return { url: `/uploads/${filename}` };
}

// ─── SYSTEM MANAGEMENT ───────────────────────────────────────────────────────

export async function getSystemAccountingData(): Promise<any> {
    await ensureSuperAdmin();
    const db = getControlDb();
    const transactions = await db.systemPayment.findMany({ orderBy: { createdAt: 'desc' }, include: { tenant: true }, take: 50 });
    const aggregates = await db.systemPayment.aggregate({ _sum: { amount: true }, _count: { id: true } });
    return { transactions, totalRevenue: aggregates._sum.amount || 0, totalCount: aggregates._count.id || 0 };
}

export async function generateApiKey(tenantId: string, label: string): Promise<any> {
    await ensureSuperAdmin();
    const db = getControlDb();
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Hospital not found');
    const apiKey = `amisi_${tenant.slug.replace(/-/g, '_')}_${uuidv4().replace(/-/g, '')}`;
    const settings = await db.globalSettings.findUnique({ where: { id: 'singleton' } });
    const existing = (settings as any)?.apiKeys || {};
    const tenantKeys = existing[tenantId] || [];
    tenantKeys.push({ key: apiKey, label, createdAt: new Date().toISOString() });
    existing[tenantId] = tenantKeys;
    await db.globalSettings.update({ where: { id: 'singleton' }, data: { apiKeys: existing } as any });
    revalidatePath('/system/dashboard');
    return { key: apiKey, label };
}
