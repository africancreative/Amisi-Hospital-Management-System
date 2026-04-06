'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId } from '@/lib/tenant';
import { postInventoryJournalEntry } from './accounting-bridge';

// Standard overtime threshold (FLSA: 40hrs/week = 8hrs/day)
const DAILY_HOURS = 8;
const OVERTIME_MULTIPLIER = 1.5;

// ---------------------------------------------------------------------------
// ATTENDANCE — CLOCK IN
// ---------------------------------------------------------------------------

export async function clockIn(employeeId: string, source: string = 'MANUAL', deviceId?: string, offlineMode = false) {
    const db = await getTenantDb();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert: create or update today's attendance log
    const existing = await db.attendanceLog.findUnique({
        where: { employeeId_date: { employeeId, date: today } }
    });

    if (existing?.clockIn) {
        throw new Error('ALREADY_CLOCKED_IN: Employee has already clocked in today.');
    }

    const log = await db.attendanceLog.upsert({
        where: { employeeId_date: { employeeId, date: today } },
        create: {
            employeeId,
            date: today,
            clockIn: new Date(),
            status: 'PRESENT',
            source,
            offlineMode,
            deviceId,
        },
        update: {
            clockIn: new Date(),
            status: 'PRESENT',
            source,
            offlineMode,
            deviceId,
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'AttendanceLog', resourceId: log.id,
        details: { action: 'CLOCK_IN', employeeId, source, offlineMode }
    });

    return log;
}

// ---------------------------------------------------------------------------
// ATTENDANCE — CLOCK OUT (auto-calculates hours + overtime)
// ---------------------------------------------------------------------------

export async function clockOut(employeeId: string, source: string = 'MANUAL', notes?: string) {
    const db = await getTenantDb();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db.attendanceLog.findUnique({
        where: { employeeId_date: { employeeId, date: today } }
    });

    if (!existing?.clockIn) throw new Error('NO_CLOCK_IN: Cannot clock out without clocking in first.');
    if (existing.clockOut) throw new Error('ALREADY_CLOCKED_OUT: Employee has already clocked out today.');

    const clockOut = new Date();
    const hoursWorked = (clockOut.getTime() - existing.clockIn!.getTime()) / 3600000;
    const overtimeHrs = Math.max(0, hoursWorked - DAILY_HOURS);

    const log = await db.attendanceLog.update({
        where: { id: existing.id },
        data: {
            clockOut,
            hoursWorked: parseFloat(hoursWorked.toFixed(2)),
            overtimeHrs: parseFloat(overtimeHrs.toFixed(2)),
            notes,
        }
    });

    await logAudit({
        action: 'UPDATE', resource: 'AttendanceLog', resourceId: log.id,
        details: { action: 'CLOCK_OUT', employeeId, hoursWorked, overtimeHrs }
    });

    return log;
}

// ---------------------------------------------------------------------------
// ATTENDANCE — MARK ABSENT (auto-run nightly or manual)
// ---------------------------------------------------------------------------

export async function markAbsentEmployees(date: Date) {
    await ensureRole(['HR_MANAGER', 'HR', 'ADMIN']);
    const db = await getTenantDb();

    // Get all active employees
    const employees = await db.employee.findMany({ where: { status: 'ACTIVE' } });
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    let markedAbsent = 0;
    for (const emp of employees) {
        const existing = await db.attendanceLog.findUnique({
            where: { employeeId_date: { employeeId: emp.id, date: d } }
        });
        if (!existing) {
            // Check if on approved leave first
            const onLeave = await db.leaveRequest.findFirst({
                where: { employeeId: emp.id, status: 'APPROVED', startDate: { lte: d }, endDate: { gte: d } }
            });
            await db.attendanceLog.create({
                data: {
                    employeeId: emp.id,
                    date: d,
                    status: onLeave ? 'ON_LEAVE' : 'ABSENT',
                    source: 'SYSTEM',
                }
            });
            markedAbsent++;
        }
    }

    return { markedAbsent };
}

// ---------------------------------------------------------------------------
// PAYROLL CALCULATION ENGINE
// ---------------------------------------------------------------------------

interface PayrollInput {
    employeeId: string;
    periodMonth: number;
    periodYear: number;
    bonus?: number;
    otherDeductions?: number;
    allowances?: number;
}

// Statutory tax brackets (illustrative — override per jurisdiction in settings)
function calculateIncomeTax(gross: number): number {
    if (gross <= 1000) return 0;
    if (gross <= 3000) return (gross - 1000) * 0.10;
    if (gross <= 6000) return 200 + (gross - 3000) * 0.20;
    return 800 + (gross - 6000) * 0.30;
}

export async function calculatePayroll(input: PayrollInput) {
    await ensureRole(['HR_MANAGER', 'ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();

    const employee = await db.employee.findUnique({ where: { id: input.employeeId } });
    if (!employee) throw new Error('Employee not found');

    // Get attendance summary for the pay period
    const start = new Date(input.periodYear, input.periodMonth - 1, 1);
    const end = new Date(input.periodYear, input.periodMonth, 0); // last day of month

    const attendance = await db.attendanceLog.findMany({
        where: { employeeId: input.employeeId, date: { gte: start, lte: end } }
    });

    const daysAbsent   = attendance.filter(a => a.status === 'ABSENT').length;
    const daysOnLeave  = attendance.filter(a => a.status === 'ON_LEAVE').length;
    const totalHours   = attendance.reduce((s, a) => s + Number(a.hoursWorked ?? 0), 0);
    const overtimeHrs  = attendance.reduce((s, a) => s + Number(a.overtimeHrs ?? 0), 0);

    const baseSalary      = Number(employee.baseSalary);
    const hourlyRate      = Number(employee.hourlyRate ?? baseSalary / 160); // 160 hrs/month
    const overtimePay     = overtimeHrs * hourlyRate * OVERTIME_MULTIPLIER;
    const absentDeduction = (baseSalary / 22) * daysAbsent; // 22 working days/month

    // Earnings
    const allowances  = input.allowances ?? 0;
    const bonus       = input.bonus ?? 0;
    const grossPay    = baseSalary + overtimePay + allowances + bonus - absentDeduction;

    // Statutory deductions (configurable per jurisdiction)
    const incomeTax   = calculateIncomeTax(grossPay);
    const nhif        = Math.min(grossPay * 0.015, 60);   // 1.5% capped at $60
    const nssf        = Math.min(grossPay * 0.06, 200);   // 6% capped at $200
    const otherDed    = input.otherDeductions ?? 0;
    const totalDed    = incomeTax + nhif + nssf + otherDed;
    const netPay      = grossPay - totalDed;

    return {
        baseSalary,
        overtimePay: parseFloat(overtimePay.toFixed(2)),
        allowances,
        bonus,
        grossPay: parseFloat(grossPay.toFixed(2)),
        incomeTax: parseFloat(incomeTax.toFixed(2)),
        nhif: parseFloat(nhif.toFixed(2)),
        nssf: parseFloat(nssf.toFixed(2)),
        otherDeductions: otherDed,
        totalDeductions: parseFloat(totalDed.toFixed(2)),
        netPay: parseFloat(netPay.toFixed(2)),
        hoursWorked: parseFloat(totalHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHrs.toFixed(2)),
        daysAbsent,
        daysOnLeave,
    };
}

// ---------------------------------------------------------------------------
// PROCESS PAYROLL — Create PayrollRecord + Payslip + GL Entry
// ---------------------------------------------------------------------------

export async function processPayroll(input: PayrollInput) {
    await ensureRole(['HR_MANAGER', 'ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();

    const employee = await db.employee.findUnique({ where: { id: input.employeeId } });
    if (!employee) throw new Error('Employee not found');

    // Prevent double-processing
    const existing = await db.payslip.findUnique({
        where: { employeeId_periodMonth_periodYear: {
            employeeId: input.employeeId,
            periodMonth: input.periodMonth,
            periodYear: input.periodYear
        }}
    });
    if (existing) throw new Error('PAYROLL_CONFLICT: Payroll already processed for this period.');

    const calc = await calculatePayroll(input);

    const { payrollRecord, payslip } = await db.$transaction(async (tx: any) => {
        // 1. Create PayrollRecord (summary)
        const pr = await tx.payrollRecord.create({
            data: {
                employeeId: input.employeeId,
                periodMonth: input.periodMonth,
                periodYear: input.periodYear,
                baseAmount: calc.baseSalary,
                bonusAmount: calc.bonus,
                deductionAmount: calc.totalDeductions,
                netAmount: calc.netPay,
                allowances: calc.allowances,
                overtimePay: calc.overtimePay,
                incomeTax: calc.incomeTax,
                nhif: calc.nhif,
                nssf: calc.nssf,
                hoursWorked: calc.hoursWorked,
                overtimeHours: calc.overtimeHours,
                status: 'processed',
            }
        });

        // 2. Create itemized Payslip
        const ps = await tx.payslip.create({
            data: {
                employeeId: input.employeeId,
                payrollRecordId: pr.id,
                periodMonth: input.periodMonth,
                periodYear: input.periodYear,
                ...calc,
                status: 'APPROVED',
            }
        });

        return { payrollRecord: pr, payslip: ps };
    });

    // 3. Post Payroll Expense to General Ledger (IFRS/GAAP)
    const fiscalPeriod = `${input.periodYear}-${String(input.periodMonth).padStart(2, '0')}`;
    await postInventoryJournalEntry({
        type: 'CLINICAL_CHARGE', // Reused as 'PAYROLL_EXPENSE' — extend accounting-bridge for full support
        sourceId: payrollRecord.id,
        amount: calc.grossPay,
        description: `Payroll: ${employee.firstName} ${employee.lastName} — ${fiscalPeriod}`,
        fiscalPeriod,
        accountingStandard: 'BOTH',
    });

    await logAudit({
        action: 'CREATE', resource: 'Payslip', resourceId: payslip.id,
        details: { employeeId: input.employeeId, netPay: calc.netPay, period: fiscalPeriod }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'PAYSLIP_READY', 'Employee', input.employeeId);

    revalidatePath('/hr/payroll');
    return { payrollRecord, payslip, calculation: calc };
}

// ---------------------------------------------------------------------------
// BATCH PAYROLL — Process all active employees for a period
// ---------------------------------------------------------------------------

export async function runMonthlyPayroll(periodMonth: number, periodYear: number) {
    await ensureRole(['HR_MANAGER', 'ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();

    const employees = await db.employee.findMany({
        where: { status: 'ACTIVE' }
    });

    const results = [];
    const errors = [];

    for (const emp of employees) {
        try {
            const result = await processPayroll({
                employeeId: emp.id,
                periodMonth,
                periodYear,
            });
            results.push({ employeeId: emp.id, netPay: result.calculation.netPay });
        } catch (err: any) {
            errors.push({ employeeId: emp.id, error: err.message });
        }
    }

    revalidatePath('/hr/payroll');
    return { processed: results.length, errors };
}

// ---------------------------------------------------------------------------
// HR DASHBOARD SUMMARY
// ---------------------------------------------------------------------------

export async function getHRDashboard() {
    await ensureRole(['HR_MANAGER', 'HR', 'ADMIN']);
    const db = await getTenantDb();

    const [totalStaff, activeToday, pendingLeaves, expiringLicenses] = await Promise.all([
        db.employee.count({ where: { status: 'ACTIVE' } }),
        db.attendanceLog.count({ where: { date: new Date(new Date().setHours(0, 0, 0, 0)), status: 'PRESENT' } }),
        db.leaveRequest.count({ where: { status: 'PENDING' } }),
        db.employee.count({
            where: {
                licenseExpiry: { lte: new Date(Date.now() + 30 * 86400000) },
                status: 'ACTIVE'
            }
        })
    ]);

    return { totalStaff, activeToday, pendingLeaves, expiringLicenses };
}
