import { tenantProcedure, router, protectedProcedure, hrProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { logAudit } from '@/lib/audit';

export const hrRouter: any = router({
  /**
   * getEmployees
   * List all employees with basic details.
   */
  getEmployees: tenantProcedure
    .query(async ({ ctx }: any) => {
      return ctx.db!.employee.findMany({
        orderBy: { lastName: 'asc' }
      });
    }),

  /**
   * createEmployee
   * HR creates a new employee record.
   */
  createEmployee: hrProcedure
    .input(z.object({
      employeeId: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.any(), // Uses Role enum in DB
      department: z.string(),
      email: z.string().email(),
      baseSalary: z.number(),
      hourlyRate: z.number().optional(),
      currency: z.string().default('USD')
    }))
    .mutation(async ({ ctx, input }: any) => {
      const employee = await ctx.db!.employee.create({
        data: {
          ...input,
          baseSalary: input.baseSalary,
          hourlyRate: input.hourlyRate
        }
      });

      await logAudit({
        action: 'CREATE',
        resource: 'Employee',
        resourceId: employee.id,
        details: { name: `${input.firstName} ${input.lastName}`, role: input.role },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return employee;
    }),

  /**
   * processPayroll
   * Generates payroll records for a specific period.
   */
  processPayroll: hrProcedure
    .input(z.object({
      month: z.number().min(1).max(12),
      year: z.number()
    }))
    .mutation(async ({ ctx, input }: any) => {
      const records = await ctx.db!.$transaction(async (tx: any) => {
        const employees = await tx.employee.findMany({ where: { status: 'ACTIVE' } });
        
        const records = [];
        for (const emp of employees) {
          const base = Number(emp.baseSalary);
          const allowances = base * 0.1;
          const tax = base * 0.05;
          const net = base + allowances - tax;

          records.push(await tx.payrollRecord.create({
            data: {
              employeeId: emp.id,
              periodMonth: input.month,
              periodYear: input.year,
              baseAmount: base,
              allowances: allowances,
              incomeTax: tax,
              netAmount: net,
              status: 'draft'
            }
          }));
        }
        return records;
      });

      await logAudit({
        action: 'UPDATE',
        resource: 'Payroll',
        details: { month: input.month, year: input.year, count: records.length },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return records;
    }),

  /**
   * getPayrollHistory
   * Fetches payroll records for a period.
   */
  getPayrollHistory: tenantProcedure
    .input(z.object({
      month: z.number(),
      year: z.number()
    }))
    .query(async ({ ctx, input }: any) => {
      return ctx.db!.payrollRecord.findMany({
        where: { periodMonth: input.month, periodYear: input.year },
        include: { employee: true }
      });
    }),

  /**
   * submitLeaveRequest
   * Employee submits a leave request.
   */
  submitLeaveRequest: protectedProcedure
    .input(z.object({
      leaveType: z.enum(['ANNUAL','SICK','MATERNITY','PATERNITY','UNPAID','COMPASSIONATE']),
      startDate: z.date(),
      endDate: z.date(),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }: any) => {
      const days = Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      return ctx.db!.leaveRequest.create({
        data: {
          employeeId: ctx.session.userId!,
          ...input,
          daysRequested: days,
          status: 'PENDING'
        }
      });
    }),

  /**
   * getLeaveRequests
   * HR fetches pending leave requests.
   */
  getLeaveRequests: tenantProcedure
    .query(async ({ ctx }: any) => {
      return ctx.db!.leaveRequest.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' }
      });
    }),

  /**
   * approveLeave
   * HR approves or rejects a leave request.
   */
  approveLeave: tenantProcedure
    .input(z.object({
      requestId: z.string(),
      approve: z.boolean(),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }: any) => {
      return ctx.db!.leaveRequest.update({
        where: { id: input.requestId },
        data: {
          status: input.approve ? 'APPROVED' : 'REJECTED',
          approvedBy: ctx.session.userId,
          approvedAt: new Date(),
          rejectionReason: input.approve ? undefined : input.reason
        }
      });
    }),

  /**
   * clockIn/clockOut
   * Attendance logging.
   */
  logAttendance: protectedProcedure
    .input(z.object({
      type: z.enum(['IN', 'OUT']),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }: any) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await ctx.db!.attendanceLog.findUnique({
        where: { employeeId_date: { employeeId: ctx.session.userId!, date: today } }
      });

      if (input.type === 'IN') {
        if (existing) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already clocked in today' });
        return ctx.db!.attendanceLog.create({
          data: {
            employeeId: ctx.session.userId!,
            date: today,
            clockIn: new Date(),
            status: 'PRESENT'
          }
        });
      } else {
        if (!existing || !existing.clockIn) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not clocked in today' });
        return ctx.db!.attendanceLog.update({
          where: { id: existing.id },
          data: {
            clockOut: new Date(),
            notes: input.notes
          }
        });
      }
    })
});
