'use server';

import { getTenantDb } from '@/lib/db';
import { ensureRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { Decimal, Role } from '@amisimedos/db/client';

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
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role as any,
            department: data.department,
            baseSalary: new Decimal(data.baseSalary),
            passwordHash: '@Amisi123',
            status: 'active',
            employeeId: data.employeeId,
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
