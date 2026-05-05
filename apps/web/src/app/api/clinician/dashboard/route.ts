import { NextResponse } from 'next/server';
import { getControlDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicianId = searchParams.get('clinicianId') || 'demo-clinician';
    const period = searchParams.get('period') || 'today'; // today, week, month

    const db = getControlDb();

    // Mock clinician profile (in production, fetch from Staff table)
    const profile = {
      id: clinicianId,
      name: 'Dr. Sarah Mwangi',
      specialization: 'Internal Medicine',
      role: 'DOCTOR',
      status: 'Off-duty',
      avatar: null,
    };

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let dateFilter: Date;
    switch (period) {
      case 'week': dateFilter = weekStart; break;
      case 'month': dateFilter = monthStart; break;
      default: dateFilter = todayStart;
    }

    // Mock performance metrics (in production, aggregate from Visit/Patient tables)
    const performance = {
      patientsSeenToday: 12,
      patientsSeenWeek: 68,
      patientsSeenMonth: 245,
      avgConsultationTime: 18, // minutes
      outcomes: {
        resolved: 78,
        referred: 15,
        followUp: 7,
      },
      followUpRate: 7, // percentage
    };

    // Mock today's schedule
    const schedule = {
      totalAppointments: 16,
      completed: 12,
      upcoming: 4,
      missed: 2,
      nextPatient: 'John Doe - 2:30 PM',
    };

    // Mock recent patients
    const recentPatients = [
      { id: '1', name: 'John Doe', age: 45, time: '10:30 AM', diagnosis: 'Hypertension', status: 'Completed' },
      { id: '2', name: 'Jane Smith', age: 32, time: '11:15 AM', diagnosis: 'Diabetes Type 2', status: 'Completed' },
      { id: '3', name: 'Bob Wilson', age: 58, time: '12:00 PM', diagnosis: 'Pneumonia', status: 'Pending' },
    ];

    // Mock tasks & follow-ups
    const tasks = [
      { id: '1', type: 'review', title: 'Review lab results for Patient #1234', priority: 'high', dueIn: '2 hours' },
      { id: '2', type: 'followup', title: 'Call Mary Johnson re: follow-up', priority: 'medium', dueIn: '4 hours' },
      { id: '3', type: 'lab', title: 'Check CBC results for Bob Wilson', priority: 'high', dueIn: '1 hour' },
    ];

    // Mock insights
    const insights = {
      commonDiagnoses: [
        { name: 'Hypertension', count: 28 },
        { name: 'Diabetes', count: 22 },
        { name: 'Pneumonia', count: 15 },
        { name: 'Asthma', count: 12 },
      ],
      workloadPattern: [
        { day: 'Mon', patients: 14 },
        { day: 'Tue', patients: 16 },
        { day: 'Wed', patients: 12 },
        { day: 'Thu', patients: 18 },
        { day: 'Fri', patients: 15 },
      ],
      alerts: [
        { type: 'warning', message: '3 delayed follow-ups this week' },
        { type: 'info', message: 'Patient load 20% above average' },
      ],
    };

    // Mock notifications
    const notifications = [
      { id: '1', type: 'lab', message: 'CBC results ready for Bob Wilson', time: '5 min ago', read: false },
      { id: '2', type: 'message', message: 'New message from Nurse Alice', time: '15 min ago', read: false },
      { id: '3', type: 'lab', message: 'X-Ray results ready for Jane Smith', time: '1 hour ago', read: true },
    ];

    return NextResponse.json({
      profile,
      performance,
      schedule,
      recentPatients,
      tasks,
      insights,
      notifications,
      period,
    });
  } catch (error) {
    console.error('Clinician dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
