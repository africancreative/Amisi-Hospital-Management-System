'use server';

import { getTenantDb } from '@/lib/db';
import { getServerUser } from '@/lib/auth-utils';
import {
    StaffActivityFilters,
    ActivityCategory,
    CATEGORY_ACTIVITIES,
    ACTIVITY_CATEGORY,
    StaffActivityEntry,
    StaffAssignment,
    StaffPerformanceMetrics,
    DepartmentPerformance,
    StaffDashboardOverview,
    StaffCardData,
} from '@/lib/staff-tracking-types';

// ─── Staff Activity Tracking (queries existing data) ───────────────────

/**
 * Fetch staff activity by querying encounters, clinical notes, chat, etc.
 * Since there's no dedicated activity log table, we aggregate from multiple sources.
 */
export async function getStaffActivity(filters?: StaffActivityFilters): Promise<any> {
    const db = await getTenantDb();
    const activities: StaffActivityEntry[] = [];

    // Date range defaults to today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dateFrom = filters?.dateFrom ?? todayStart;
    const dateTo = filters?.dateTo ?? new Date();

    // ── Queue/Encounter Activities ───────────────────────────────────
    const encounterWhere: Record<string, unknown> = {
        status: { not: 'REGISTERED' },
        seenAt: { gte: dateFrom, lte: dateTo },
    };
    if (filters?.department) encounterWhere.department = filters.department;
    if (filters?.employeeId) encounterWhere.doctorId = filters.employeeId;

    const encounters = await db.encounter.findMany({
        where: encounterWhere,
        orderBy: { seenAt: 'desc' },
        take: 200,
    });

    for (const enc of encounters) {
        activities.push({
            id: `enc-${enc.id}`,
            employeeId: enc.doctorId ?? '',
            employeeName: enc.doctorName,
            employeeRole: 'DOCTOR',
            department: enc.department ?? '',
            activityType: 'ENCOUNTER_COMPLETE',
            category: ACTIVITY_CATEGORY.CLINICAL,
            patientId: enc.patientId,
            encounterId: enc.id,
            queueNumber: enc.queueNumber,
            title: `Consultation completed: ${enc.queueNumber ?? enc.id.slice(0, 8)}`,
            description: enc.department ? `Department: ${enc.department}` : undefined,
            startedAt: enc.seenAt,
            completedAt: enc.completedAt ?? enc.updatedAt,
            durationSeconds: enc.completedAt && enc.seenAt
                ? Math.round((enc.completedAt.getTime() - enc.seenAt.getTime()) / 1000)
                : undefined,
        });
    }

    // ── Clinical Note Activities ─────────────────────────────────────
    const noteWhere: Record<string, unknown> = { createdAt: { gte: dateFrom, lte: dateTo } };
    if (filters?.employeeId) noteWhere.authorId = filters.employeeId;

    const notes = await db.clinicalNote.findMany({
        where: noteWhere,
        include: { author: { select: { id: true, firstName: true, lastName: true, role: true, department: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    for (const note of notes) {
        const author = note.author;
        if (!author) continue;
        activities.push({
            id: `note-${note.id}`,
            employeeId: author.id,
            employeeName: `${author.firstName} ${author.lastName}`,
            employeeRole: author.role as string,
            department: author.department,
            activityType: 'CLINICAL_NOTE_CREATED',
            category: ACTIVITY_CATEGORY.CLINICAL,
            patientId: note.patientId,
            encounterId: note.encounterId,
            resourceId: note.id,
            resourceType: 'ClinicalNote',
            title: `${note.type} note created`,
            description: note.content?.substring(0, 200) ?? undefined,
            completedAt: note.createdAt,
        });
    }

    // ── Chat Message Activities ──────────────────────────────────────
    const chatWhere: Record<string, unknown> = { timestamp: { gte: dateFrom, lte: dateTo } };
    if (filters?.employeeId) chatWhere.authorId = filters.employeeId;

    const messages = await db.chatMessage.findMany({
        where: chatWhere,
        orderBy: { timestamp: 'desc' },
        take: 100,
    });

    for (const msg of messages) {
        if (!msg.authorId || msg.authorId === 'SYSTEM') continue;
        activities.push({
            id: `chat-${msg.id}`,
            employeeId: msg.authorId,
            employeeName: msg.authorName,
            employeeRole: msg.authorRole,
            department: '',
            activityType: 'CHAT_MESSAGE_SENT',
            category: ACTIVITY_CATEGORY.COMMUNICATION,
            patientId: msg.patientId,
            resourceId: msg.id,
            resourceType: 'ChatMessage',
            title: `Message sent`,
            description: msg.content?.substring(0, 100) ?? undefined,
            completedAt: msg.timestamp,
        });
    }

    // ── Attendance Activities ────────────────────────────────────────
    const attendanceWhere: Record<string, unknown> = { date: { gte: dateFrom, lte: dateTo } };
    if (filters?.employeeId) attendanceWhere.employeeId = filters.employeeId;

    const attendance = await db.attendanceLog.findMany({
        where: attendanceWhere,
        include: { employee: { select: { id: true, firstName: true, lastName: true, role: true, department: true } } },
        orderBy: { clockIn: 'desc' },
        take: 100,
    });

    for (const att of attendance) {
        const emp = att.employee;
        if (!emp || !att.clockIn) continue;
        activities.push({
            id: `att-${att.id}`,
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            employeeRole: emp.role as string,
            department: emp.department,
            activityType: 'SHIFT_CLOCK_IN',
            category: ACTIVITY_CATEGORY.ADMINISTRATIVE,
            title: `Clocked in`,
            description: att.source ? `Source: ${att.source}` : undefined,
            startedAt: att.clockIn,
            completedAt: att.clockOut ?? new Date(),
            durationSeconds: att.clockOut && att.clockIn
                ? Math.round((att.clockOut.getTime() - att.clockIn.getTime()) / 1000)
                : undefined,
        });
    }

    // Sort all activities by completedAt
    activities.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    // Apply category filter
    if (filters?.categories && filters.categories.length > 0) {
        const allowedTypes = filters.categories.flatMap(
            (cat) => CATEGORY_ACTIVITIES[cat] ?? []
        );
        return activities.filter((a: any) => allowedTypes.includes(a.activityType));
    }

    return activities;
}

// ─── Staff Assignment Tracking ──────────────────────────────────────────

/**
 * Get current staff assignments (active queue/department/patient assignments)
 */
export async function getActiveStaffAssignments(): Promise<any> {
    const db = await getTenantDb();

    // Get encounters that are in progress (assigned to a doctor)
    const activeEncounters = await db.encounter.findMany({
        where: {
            status: { in: ['IN_CONSULTATION', 'TRIAGE_ASSIGNED', 'DIAGNOSTICS_PENDING'] },
            doctorId: { not: null },
        },
        include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { seenAt: 'desc' },
    });

    const assignments: StaffAssignment[] = activeEncounters.map((enc: any) => ({
        id: enc.id,
        employeeId: enc.doctorId!,
        employeeName: enc.doctorName,
        employeeRole: 'DOCTOR',
        department: enc.department ?? '',
        assignmentType: 'PATIENT',
        patientId: enc.patientId,
        patientName: enc.patient ? `${enc.patient.firstName} ${enc.patient.lastName}` : undefined,
        encounterId: enc.id,
        queueNumber: enc.queueNumber,
        assignedAt: enc.seenAt ?? enc.createdAt,
        isActive: true,
    }));

    // Get employees who are clocked in (on duty)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clockedIn = await db.attendanceLog.findMany({
        where: {
            date: { gte: today },
            clockIn: { not: null },
            clockOut: null,
        },
        include: { employee: { select: { id: true, firstName: true, lastName: true, role: true, department: true } } },
    });

    for (const att of clockedIn) {
        const emp = att.employee;
        if (!emp) continue;
        // Check if already in assignments
        if (!assignments.find((a: any) => a.employeeId === emp.id && a.isActive)) {
            assignments.push({
                id: `att-${att.id}`,
                employeeId: emp.id,
                employeeName: `${emp.firstName} ${emp.lastName}`,
                employeeRole: emp.role as string,
                department: emp.department,
                assignmentType: 'DEPARTMENT',
                departmentName: emp.department,
                assignedAt: att.clockIn!,
                isActive: true,
            });
        }
    }

    return assignments;
}

// ─── Performance Metrics Calculation ────────────────────────────────────

/**
 * Calculate performance metrics for a specific employee over a period.
 */
export async function getEmployeePerformance(
    employeeId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    customStart?: Date,
    customEnd?: Date
): Promise<StaffPerformanceMetrics | null> {
    const db = await getTenantDb();

    // Get employee details
    const employee = await db.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return null;

    // Calculate date range
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date = now;

    if (customStart && customEnd) {
        periodStart = customStart;
        periodEnd = customEnd;
    } else {
        switch (period) {
            case 'daily':
                periodStart = new Date(now);
                periodStart.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                periodStart = new Date(now);
                periodStart.setDate(periodStart.getDate() - 7);
                break;
            case 'monthly':
                periodStart = new Date(now);
                periodStart.setMonth(periodStart.getMonth() - 1);
                break;
        }
    }

    // ── Encounters (patients seen) ───────────────────────────────────
    const encounters = await db.encounter.findMany({
        where: {
            doctorId: employeeId,
            seenAt: { gte: periodStart, lte: periodEnd },
            status: { not: 'REGISTERED' },
        },
    });

    const patientsSeen = encounters.length;
    const completedEncounters = encounters.filter((e: any) => e.status === 'COMPLETED' || e.status === 'BILLING_COMPLETE');
    const encountersCompleted = completedEncounters.length;

    // Average consultation time
    let totalConsultationSeconds = 0;
    let consultationCount = 0;
    for (const enc of completedEncounters) {
        if (enc.completedAt && enc.seenAt) {
            totalConsultationSeconds += (enc.completedAt.getTime() - enc.seenAt.getTime()) / 1000;
            consultationCount++;
        }
    }
    const avgConsultationMinutes = consultationCount > 0
        ? Math.round((totalConsultationSeconds / consultationCount) / 60)
        : 0;

    // Average wait time (time from check-in to seen)
    let totalWaitSeconds = 0;
    let waitCount = 0;
    for (const enc of encounters) {
        if (enc.seenAt && enc.checkedInAt) {
            totalWaitSeconds += (enc.seenAt.getTime() - enc.checkedInAt.getTime()) / 1000;
            waitCount++;
        }
    }
    const avgWaitTimeMinutes = waitCount > 0
        ? Math.round((totalWaitSeconds / waitCount) / 60)
        : 0;

    // ── Clinical Notes ───────────────────────────────────────────────
    const clinicalNotes = await db.clinicalNote.count({
        where: {
            authorId: employeeId,
            createdAt: { gte: periodStart, lte: periodEnd },
        },
    });

    // ── Chat Messages ────────────────────────────────────────────────
    const chatMessages = await db.chatMessage.count({
        where: {
            authorId: employeeId,
            timestamp: { gte: periodStart, lte: periodEnd },
        },
    });

    // ── Attendance (total active minutes) ────────────────────────────
    const attendance = await db.attendanceLog.findMany({
        where: {
            employeeId,
            date: { gte: periodStart, lte: periodEnd },
            clockIn: { not: null },
        },
    });

    let totalActiveMinutes = 0;
    for (const att of attendance) {
        if (att.clockIn && att.clockOut) {
            totalActiveMinutes += Math.round((att.clockOut.getTime() - att.clockIn.getTime()) / 60000);
        } else if (att.clockIn) {
            totalActiveMinutes += Math.round((now.getTime() - att.clockIn.getTime()) / 60000);
        }
    }

    // ── Lab Orders ───────────────────────────────────────────────────
    const labOrders = await db.labOrder.count({
        where: {
            encounterId: { in: encounters.map((e: any) => e.id) },
            createdAt: { gte: periodStart, lte: periodEnd },
        },
    });

    // ── Prescriptions ────────────────────────────────────────────────
    const prescriptions = await db.prescription.count({
        where: {
            encounterId: { in: encounters.map((e: any) => e.id) },
            createdAt: { gte: periodStart, lte: periodEnd },
        },
    });

    // ── Calculate utilization ────────────────────────────────────────
    const totalPatientMinutes = Math.round(totalConsultationSeconds / 60);
    const utilizationPercent = totalActiveMinutes > 0
        ? Math.round((totalPatientMinutes / totalActiveMinutes) * 100)
        : 0;

    // ── Efficiency Score (0-100) ─────────────────────────────────────
    // Based on: patients seen, consultation efficiency, notes written, responsiveness
    const patientScore = Math.min(patientsSeen * 5, 30);
    const efficiencyScore = Math.min(
        patientScore +
        (avgConsultationMinutes > 0 && avgConsultationMinutes < 30 ? 20 : 10) +
        Math.min(clinicalNotes * 3, 20) +
        Math.min(chatMessages * 2, 15) +
        (utilizationPercent > 50 ? 15 : 5),
        100
    );

    return {
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeRole: employee.role as string,
        department: employee.department,
        period,
        periodStart,
        periodEnd,
        patientsSeen,
        avgWaitTimeMinutes,
        avgConsultationMinutes,
        queueAssignments: patientsSeen,
        encountersCompleted,
        clinicalNotesWritten: clinicalNotes,
        prescriptionsWritten: prescriptions,
        labOrdersPlaced: labOrders,
        radiologyOrdersPlaced: 0,
        chatMessagesSent: chatMessages,
        avgResponseTimeMinutes: 0,
        totalActiveMinutes,
        totalPatientMinutes,
        utilizationPercent,
        efficiencyScore,
    };
}

/**
 * Get performance metrics for all staff in a department.
 */
export async function getDepartmentPerformance(department: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> {
    const db = await getTenantDb();

    const employees = await db.employee.findMany({
        where: { department, status: 'ACTIVE' },
    });

    let totalPatients = 0;
    let totalEncounters = 0;
    let totalConsultationMinutes = 0;
    let consultationCount = 0;
    let totalChatMessages = 0;
    const performances: StaffPerformanceMetrics[] = [];
    const activeStaff = employees.filter((e: any) => e.status === 'ACTIVE').length;

    for (const emp of employees) {
        const perf = await getEmployeePerformance(emp.id, period);
        if (!perf) continue;

        performances.push(perf);
        totalPatients += perf.patientsSeen;
        totalEncounters += perf.encountersCompleted;
        totalChatMessages += perf.chatMessagesSent;

        if (perf.avgConsultationMinutes > 0) {
            totalConsultationMinutes += perf.avgConsultationMinutes * perf.encountersCompleted;
            consultationCount += perf.encountersCompleted;
        }
    }

    // Sort by efficiency score
    performances.sort((a, b) => b.efficiencyScore - a.efficiencyScore);

    return {
        department,
        totalStaff: employees.length,
        activeStaff,
        patientsSeen: totalPatients,
        avgConsultationMinutes: consultationCount > 0 ? Math.round(totalConsultationMinutes / consultationCount) : 0,
        totalEncounters,
        totalChatMessages,
        topPerformers: performances.slice(0, 5),
    };
}

/**
 * Get staff dashboard overview.
 */
export async function getStaffDashboardOverview(): Promise<StaffDashboardOverview> {
    const db = await getTenantDb();

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Total active staff
    const totalActiveStaff = await db.employee.count({ where: { status: 'ACTIVE' } });
    const staffOnLeave = await db.employee.count({ where: { status: 'ON_LEAVE' } });

    // Staff on duty today
    const onDuty = await db.attendanceLog.count({
        where: {
            date: { gte: todayStart },
            clockIn: { not: null },
            clockOut: null,
        },
    });

    // Patients/encounters today
    const encountersToday = await db.encounter.count({
        where: { seenAt: { gte: todayStart } },
    });

    // Average consultation time today
    const completedToday = await db.encounter.findMany({
        where: {
            seenAt: { gte: todayStart },
            completedAt: { not: null },
            status: { in: ['COMPLETED', 'BILLING_COMPLETE'] },
        },
    });

    let totalConsultationSeconds = 0;
    for (const enc of completedToday) {
        if (enc.completedAt && enc.seenAt) {
            totalConsultationSeconds += (enc.completedAt.getTime() - enc.seenAt.getTime()) / 1000;
        }
    }
    const avgConsultationTimeToday = completedToday.length > 0
        ? Math.round((totalConsultationSeconds / completedToday.length) / 60)
        : 0;

    // Busiest department
    const deptCounts = await db.encounter.groupBy({
        by: ['department'],
        where: { seenAt: { gte: todayStart }, department: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
    });
    const busiestDepartment = deptCounts.length > 0 ? (deptCounts[0].department ?? 'Unknown') : 'N/A';

    // Department summaries
    const departments = await db.employee.groupBy({
        by: ['department'],
        _count: { id: true },
    });

    const departmentSummaries: DepartmentPerformance[] = [];
    for (const dept of departments.filter((d: any) => d.department)) {
        const summary = await getDepartmentPerformance(dept.department!, 'daily');
        departmentSummaries.push(summary);
    }

    // Top performer today
    const allEmployees = await db.employee.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
    });

    let topPerformerToday: StaffPerformanceMetrics | null = null;
    let topScore = 0;
    for (const emp of allEmployees.slice(0, 50)) {
        const perf = await getEmployeePerformance(emp.id, 'daily');
        if (perf && perf.efficiencyScore > topScore) {
            topScore = perf.efficiencyScore;
            topPerformerToday = perf;
        }
    }

    return {
        totalActiveStaff,
        staffOnDuty: onDuty,
        staffOnLeave,
        totalPatientsToday: encountersToday,
        totalEncountersToday: encountersToday,
        avgConsultationTimeToday,
        busiestDepartment,
        topPerformerToday,
        departmentSummaries,
    };
}

/**
 * Get staff cards for list views.
 */
export async function getStaffCards(): Promise<StaffCardData[]> {
    const db = await getTenantDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await db.employee.findMany({
        where: { status: { in: ['ACTIVE', 'ON_LEAVE'] } },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    // Get active assignments
    const activeAssignments = await getActiveStaffAssignments();

    // Get today's attendance
    const todayAttendance = await db.attendanceLog.findMany({
        where: { date: { gte: today }, clockIn: { not: null } },
    });
    const onDutyIds = new Set(todayAttendance.map((a: any) => a.employeeId));

    // Get today's encounter counts per doctor
    const todayEncounters = await db.encounter.findMany({
        where: { seenAt: { gte: today }, doctorId: { not: null } },
        select: { doctorId: true, status: true },
    });

    const encounterCounts = new Map<string, number>();
    const activeEncounterCounts = new Map<string, number>();
    for (const enc of todayEncounters) {
        if (enc.doctorId) {
            encounterCounts.set(enc.doctorId, (encounterCounts.get(enc.doctorId) ?? 0) + 1);
            if (['IN_CONSULTATION', 'TRIAGE_ASSIGNED'].includes(enc.status)) {
                activeEncounterCounts.set(enc.doctorId, (activeEncounterCounts.get(enc.doctorId) ?? 0) + 1);
            }
        }
    }

    return employees.map((emp: any) => {
        const currentAssignment = activeAssignments.find((a: any) => a.employeeId === emp.id && a.isActive);
        const patientsSeen = encounterCounts.get(emp.id) ?? 0;
        const activeEncounters = activeEncounterCounts.get(emp.id) ?? 0;

        return {
            id: emp.id,
            employeeId: emp.employeeId,
            firstName: emp.firstName,
            lastName: emp.lastName,
            role: emp.role as string,
            department: emp.department,
            status: emp.status,
            currentAssignment: currentAssignment ?? null,
            todayMetrics: {
                patientsSeen,
                activeEncounters,
                totalMinutes: 0,
            },
            isOnDuty: onDutyIds.has(emp.id),
        };
    });
}

// ─── Convenience Functions for Integration ──────────────────────────────

/**
 * Record staff assignment to a patient encounter.
 * Called when queue calls next patient.
 */
export async function recordStaffAssignment(data: {
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    department: string;
    encounterId: string;
    patientId?: string;
    patientName?: string;
    queueNumber?: string;
}): Promise<any> {
    const db = await getTenantDb();

    return {
        assignment: {
            id: data.encounterId,
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            employeeRole: data.employeeRole,
            department: data.department,
            assignmentType: 'PATIENT' as const,
            patientId: data.patientId,
            patientName: data.patientName,
            encounterId: data.encounterId,
            queueNumber: data.queueNumber,
            assignedAt: new Date(),
            isActive: true,
        },
    };
}

/**
 * Get staff workload distribution across departments.
 */
export async function getWorkloadDistribution(): Promise<any> {
    const db = await getTenantDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const encounters = await db.encounter.findMany({
        where: { seenAt: { gte: today }, department: { not: null } },
        select: { department: true, doctorId: true, status: true },
    });

    const deptWorkload = new Map<string, { total: number; active: number; staff: Set<string> }>();

    for (const enc of encounters) {
        const dept = enc.department!;
        if (!deptWorkload.has(dept)) {
            deptWorkload.set(dept, { total: 0, active: 0, staff: new Set() });
        }
        const data = deptWorkload.get(dept)!;
        data.total++;
        if (['IN_CONSULTATION', 'TRIAGE_ASSIGNED', 'DIAGNOSTICS_PENDING'].includes(enc.status)) {
            data.active++;
        }
        if (enc.doctorId) data.staff.add(enc.doctorId);
    }

    return Array.from(deptWorkload.entries()).map(([dept, data]) => ({
        department: dept,
        totalEncounters: data.total,
        activeEncounters: data.active,
        staffCount: data.staff.size,
        loadPerStaff: data.staff.size > 0 ? Math.round(data.total / data.staff.size * 10) / 10 : 0,
    }));
}
