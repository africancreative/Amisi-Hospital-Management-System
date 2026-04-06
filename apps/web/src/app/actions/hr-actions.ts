'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId } from '@/lib/tenant';

// ---------------------------------------------------------------------------
// EMPLOYEE ONBOARDING
// ---------------------------------------------------------------------------

export async function onboardEmployee(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    contractType?: string;
    baseSalary: number;
    hourlyRate?: number;
    currency?: string;
    nationalId?: string;
    phone?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    licenseBody?: string;
    probationDays?: number;
    emergencyName?: string;
    emergencyPhone?: string;
}) {
    await ensureRole(['HR_MANAGER', 'HR', 'ADMIN']);
    const db = await getTenantDb();

    // Generate unique employee ID: EMP-YYYY-XXXX
    const count = await db.employee.count();
    const employeeId = `EMP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const probationEnds = data.probationDays
        ? new Date(Date.now() + data.probationDays * 86400000)
        : undefined;

    const employee = await db.employee.create({
        data: {
            employeeId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role as any,
            department: data.department,
            contractType: data.contractType ?? 'FULL_TIME',
            baseSalary: data.baseSalary,
            hourlyRate: data.hourlyRate,
            currency: data.currency ?? 'USD',
            nationalId: data.nationalId,
            phone: data.phone,
            licenseNumber: data.licenseNumber,
            licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : undefined,
            licenseBody: data.licenseBody,
            probationEnds,
            emergencyName: data.emergencyName,
            emergencyPhone: data.emergencyPhone,
            status: 'ACTIVE',
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'Employee', resourceId: employee.id,
        details: { employeeId, role: data.role, department: data.department }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'EMPLOYEE_ONBOARDED', 'Employee', employee.id);

    revalidatePath('/hr/staff');
    return employee;
}

// ---------------------------------------------------------------------------
// CREDENTIAL VERIFICATION
// ---------------------------------------------------------------------------

export async function updateCredentials(employeeId: string, docs: {
    name: string;
    url: string;
    expiry?: string;
}[]) {
    await ensureRole(['HR_MANAGER', 'HR', 'ADMIN']);
    const db = await getTenantDb();

    const employee = await db.employee.update({
        where: { id: employeeId },
        data: { credentialsDocs: docs }
    });

    // Alert for expiring credentials (< 30 days)
    const expiring = docs.filter(d => {
        if (!d.expiry) return false;
        return new Date(d.expiry).getTime() - Date.now() < 30 * 86400000;
    });

    if (expiring.length > 0) {
        const tenantId = await getResolvedTenantId();
        if (tenantId) {
            realtimeHub.broadcast(tenantId, 'CREDENTIAL_EXPIRY_ALERT', 'Employee', employeeId, {
                expiring: expiring.map(d => d.name)
            });
        }
    }

    await logAudit({
        action: 'UPDATE', resource: 'Employee', resourceId: employeeId,
        details: { action: 'CREDENTIALS_UPDATED', docCount: docs.length }
    });

    return employee;
}

// ---------------------------------------------------------------------------
// SHIFT SCHEDULING
// ---------------------------------------------------------------------------

export async function assignShift(data: {
    employeeId: string;
    shiftDate: string;
    startTime: string;
    endTime: string;
    shiftType?: string;
    department: string;
    ward?: string;
    notes?: string;
}) {
    await ensureRole(['HR_MANAGER', 'HR', 'ADMIN']);
    const db = await getTenantDb();

    const shift = await db.shiftSchedule.create({
        data: {
            employeeId: data.employeeId,
            shiftDate: new Date(data.shiftDate),
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            shiftType: data.shiftType ?? 'DAY',
            department: data.department,
            ward: data.ward,
            notes: data.notes,
            isPublished: true,
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'ShiftSchedule', resourceId: shift.id,
        details: { employeeId: data.employeeId, shiftType: data.shiftType, shiftDate: data.shiftDate }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'SHIFT_ASSIGNED', 'Employee', data.employeeId);

    revalidatePath('/hr/schedule');
    return shift;
}

export async function getWeeklySchedule(weekStart: string) {
    await ensureRole(['HR_MANAGER', 'HR', 'ADMIN', 'DOCTOR', 'NURSE']);
    const db = await getTenantDb();

    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return db.shiftSchedule.findMany({
        where: { shiftDate: { gte: start, lt: end }, isPublished: true },
        include: { employee: { select: { id: true, firstName: true, lastName: true, role: true, department: true } } },
        orderBy: [{ shiftDate: 'asc' }, { startTime: 'asc' }]
    });
}

// ---------------------------------------------------------------------------
// LEAVE MANAGEMENT
// ---------------------------------------------------------------------------

export async function requestLeave(data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
    medicalCertUrl?: string;
}) {
    const db = await getTenantDb();

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const daysRequested = Math.ceil((end.getTime() - start.getTime()) / 86400000);

    const leave = await db.leaveRequest.create({
        data: {
            employeeId: data.employeeId,
            leaveType: data.leaveType,
            startDate: start,
            endDate: end,
            daysRequested,
            reason: data.reason,
            medicalCertUrl: data.medicalCertUrl,
            status: 'PENDING',
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'LeaveRequest', resourceId: leave.id,
        details: { employeeId: data.employeeId, leaveType: data.leaveType, daysRequested }
    });

    revalidatePath('/hr/leave');
    return leave;
}

export async function approveLeave(leaveId: string, approvedBy: string, approved: boolean, rejectionReason?: string) {
    await ensureRole(['HR_MANAGER', 'HR', 'ADMIN']);
    const db = await getTenantDb();

    const leave = await db.leaveRequest.update({
        where: { id: leaveId },
        data: {
            status: approved ? 'APPROVED' : 'REJECTED',
            approvedBy,
            approvedAt: new Date(),
            rejectionReason: approved ? undefined : rejectionReason,
        }
    });

    // Update employee status when leave starts
    if (approved) {
        const today = new Date();
        if (leave.startDate <= today) {
            await db.employee.update({
                where: { id: leave.employeeId },
                data: { status: 'ON_LEAVE' }
            });
        }
    }

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, approved ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED', 'Employee', leave.employeeId);
    }

    revalidatePath('/hr/leave');
    return leave;
}

export async function getEmployees() {
    const db = await getTenantDb();
    return db.employee.findMany({
        orderBy: { lastName: 'asc' }
    });
}

export async function getPayrollHistory() {
    const db = await getTenantDb();
    return db.payrollRecord.findMany({
        include: { employee: true },
        orderBy: { createdAt: 'desc' }
    });
}
