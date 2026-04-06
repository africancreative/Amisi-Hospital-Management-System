'use server';

import { getTenantDb } from '@/lib/db';
import { ensureRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { Decimal, Role } from '@amisi/database';

export async function getEmployees() {
    await ensureRole(['ADMIN']);
    const db = await getTenantDb();
    return db.employee.findMany({
        orderBy: [{ role: 'asc' }, { lastName: 'asc' }]
    });
}

export async function addEmployee(data: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    department: string;
    baseSalary: number;
}) {
    await ensureRole(['ADMIN']);
    const db = await getTenantDb();

    const employee = await db.employee.create({
        data: {
            ...data,
            baseSalary: new Decimal(data.baseSalary),
            passwordHash: '@Amisi123', // Default password for new employees
            status: 'active'
        }
    });

    revalidatePath('/users');
    return employee;
}

export async function removeEmployee(id: string) {
    await ensureRole(['ADMIN']);
    const db = await getTenantDb();

    // Soft delete by setting status to inactive
    const employee = await db.employee.update({
        where: { id },
        data: { status: 'inactive' }
    });

    revalidatePath('/users');
    return employee;
}
