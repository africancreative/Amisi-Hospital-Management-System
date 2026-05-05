'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

interface DashboardData {
  profile: {
    id: string;
    name: string;
    specialization: string;
    role: string;
    status: string;
    avatar: string | null;
  };
  performance: {
    patientsSeenToday: number;
    patientsSeenWeek: number;
    patientsSeenMonth: number;
    avgConsultationTime: number;
    outcomes: { resolved: number; referred: number; followUp: number };
    followUpRate: number;
  };
  schedule: {
    totalAppointments: number;
    completed: number;
    upcoming: number;
    missed: number;
    nextPatient: string;
  };
  recentPatients: Array<{
    id: string;
    name: string;
    age: number;
    time: string;
    diagnosis: string;
    status: string;
  }>;
  tasks: Array<{
    id: string;
    type: string;
    title: string;
    priority: string;
    dueIn: string;
  }>;
  insights: {
    commonDiagnoses: Array<{ name: string; count: number }>;
    workloadPattern: Array<{ day: string; patients: number }>;
    alerts: Array<{ type: string; message: string }>;
  };
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    read: boolean;
  }>;
  period: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ClinicianDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetch(`/api/clinician/dashboard?period=${period}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ padding: '32px' }}>Failed to load dashboard.</div>;

  const { profile, performance, schedule, recentPatients, tasks, insights, notifications } = data;

  const statusColor = profile.status === 'On-duty' ? '#dc2626' : '#059669';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top: Profile Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 600,
          }}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              {profile.name}
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {profile.specialization} • {profile.role}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 500,
            backgroundColor: profile.status === 'On-duty' ? '#fef2f2' : '#f0fdf4',
            color: statusColor,
          }}>
            ● {profile.status}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Today's Schedule</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              {schedule.completed}/{schedule.totalAppointments} completed
            </p>
          </div>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr 320px',
        gap: 0,
        minHeight: 'calc(100vh - 81px)',
      }}>
        {/* Left: Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
          padding: '16px',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Patients', icon: '👥', active: true },
              { label: 'Reports', icon: '📊', active: false },
              { label: 'Schedule', icon: '📅', active: false },
              { label: 'Tasks', icon: '✅', active: false },
              { label: 'Settings', icon: '⚙️', active: false },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: item.active ? 600 : 400,
                  backgroundColor: item.active ? '#eff6ff' : 'transparent',
                  color: item.active ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          {/* Period Selector */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>TIME PERIOD</p>
            {(['today', 'week', 'month'] as const).map(p => (
              <div
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: p === period ? 600 : 400,
                  backgroundColor: p === period ? '#f1f5f9' : 'transparent',
                  color: p === period ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Insights & Activity */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* Performance Metrics */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Performance Metrics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Patients Seen', today: performance.patientsSeenToday, week: performance.patientsSeenWeek, month: performance.patientsSeenMonth },
                { label: 'Avg Consult (min)', value: performance.avgConsultationTime },
                { label: 'Follow-up Rate', value: `${performance.followUpRate}%` },
              ].map((metric, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, marginBottom: '8px' }}>{metric.label}</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {'today' in metric ? (metric as any)[period] : metric.value}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Workload Pattern</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={insights.workloadPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Patients */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Recent Patients</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {recentPatients.map((patient, idx) => (
                <div
                  key={patient.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: idx < recentPatients.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: 0 }}>{patient.name} ({patient.age})</p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{patient.diagnosis} • {patient.time}</p>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: patient.status === 'Completed' ? '#f0fdf4' : '#fef3c7',
                    color: patient.status === 'Completed' ? '#166534' : '#92400e',
                  }}>
                    {patient.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Panel */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Insights Panel</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Common Diagnoses</p>
                {insights.commonDiagnoses.map((dx, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: '13px', color: '#475569' }}>{dx.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{dx.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Outcomes</p>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Resolved', value: performance.outcomes.resolved },
                        { name: 'Referred', value: performance.outcomes.referred },
                        { name: 'Follow-up', value: performance.outcomes.followUp },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map(index => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {insights.alerts.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                {insights.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      backgroundColor: alert.type === 'warning' ? '#fef3c7' : '#f0f9ff',
                      border: `1px solid ${alert.type === 'warning' ? '#fcd34d' : '#bae6fd'}`,
                      fontSize: '13px',
                      color: alert.type === 'warning' ? '#92400e' : '#075985',
                    }}
                  >
                    {alert.type === 'warning' ? '⚠️' : 'ℹ️'} {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications & Tasks */}
        <div style={{
          backgroundColor: 'white',
          borderLeft: '1px solid #e2e8f0',
          padding: '16px',
          overflowY: 'auto',
        }}>
          {/* Tasks & Follow-ups */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Tasks & Follow-ups</h3>
            {tasks.map(task => (
              <div
                key={task.id}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: task.priority === 'high' ? '#fef2f2' : '#f0fdf4',
                    color: task.priority === 'high' ? '#dc2626' : '#059669',
                    textTransform: 'capitalize',
                  }}>
                    {task.priority}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{task.dueIn}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>{task.title}</p>
              </div>
            ))}
          </div>

          {/* Notifications */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Notifications</h3>
            {notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: notif.read ? 'transparent' : '#eff6ff',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#3b82f6', textTransform: 'capitalize' }}>● {notif.type}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{notif.time}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
