'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Clock,
    Activity,
    TrendingUp,
    Building,
    UserCheck,
    UserMinus,
    Award,
    ChevronRight,
    BarChart3,
    Timer,
    MessageSquare,
    FileText,
    Pill,
    FlaskConical,
    Stethoscope,
} from 'lucide-react';
import { getStaffDashboardOverview, getStaffCards, getWorkloadDistribution } from '@/lib/staff-tracking-actions';
import { StaffPerformanceMetrics, DepartmentPerformance, StaffCardData } from '@/lib/staff-tracking-types';

interface StaffDashboardProps {
    initialOverview?: Awaited<ReturnType<typeof getStaffDashboardOverview>>;
}

export function StaffPerformanceDashboard({ initialOverview }: StaffDashboardProps) {
    const [overview, setOverview] = useState(initialOverview ?? null);
    const [loading, setLoading] = useState(!initialOverview);
    const [staffCards, setStaffCards] = useState<StaffCardData[]>([]);
    const [workload, setWorkload] = useState<Array<{ department: string; totalEncounters: number; activeEncounters: number; staffCount: number; loadPerStaff: number }>>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'departments'>('overview');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [overviewData, cardsData, workloadData] = await Promise.all([
                getStaffDashboardOverview(),
                getStaffCards(),
                getWorkloadDistribution(),
            ]);
            setOverview(overviewData);
            setStaffCards(cardsData);
            setWorkload(workloadData);
            setLoading(false);
        }
        if (!initialOverview) fetchData();
    }, [initialOverview]);

    if (loading || !overview) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    const filteredStaff = selectedDepartment === 'all'
        ? staffCards
        : staffCards.filter((s: any) => s.department === selectedDepartment);

    const departments = Array.from(new Set(staffCards.map((s: any) => s.department)));

    return (
        <div className="h-full flex flex-col bg-[#07070a] text-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800/50 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black tracking-tight flex items-center gap-3">
                            <Activity className="h-6 w-6 text-blue-500" />
                            Staff Performance Dashboard
                        </h1>
                        <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-widest">Real-time workforce analytics</p>
                    </div>
                    <div className="flex gap-2">
                        {(['daily', 'weekly', 'monthly'] as const).map((p: any) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    period === p
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800/60 text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'staff', label: 'Staff Roster', icon: Users },
                        { id: 'departments', label: 'Departments', icon: Building },
                    ].map((tab: any) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                activeTab === tab.id
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-600 hover:text-gray-400'
                            }`}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && <OverviewTab overview={overview} workload={workload} />}
                {activeTab === 'staff' && (
                    <StaffTab
                        staff={filteredStaff}
                        departments={departments}
                        selectedDepartment={selectedDepartment}
                        onDepartmentChange={setSelectedDepartment}
                    />
                )}
                {activeTab === 'departments' && <DepartmentTab departments={overview.departmentSummaries} />}
            </div>
        </div>
    );
}

function OverviewTab({ overview, workload }: { overview: NonNullable<Awaited<ReturnType<typeof getStaffDashboardOverview>>>; workload: Array<{ department: string; totalEncounters: number; activeEncounters: number; staffCount: number; loadPerStaff: number }> }) {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={UserCheck}
                    label="Staff On Duty"
                    value={overview.staffOnDuty}
                    subtext={`of ${overview.totalActiveStaff} active`}
                    color="blue"
                />
                <KpiCard
                    icon={UserMinus}
                    label="On Leave"
                    value={overview.staffOnLeave}
                    color="amber"
                />
                <KpiCard
                    icon={Users}
                    label="Patients Today"
                    value={overview.totalPatientsToday}
                    color="emerald"
                />
                <KpiCard
                    icon={Timer}
                    label="Avg Consult"
                    value={`${overview.avgConsultationTimeToday}m`}
                    color="purple"
                />
            </div>

            {/* Top Performer */}
            {overview.topPerformerToday && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Award className="h-5 w-5 text-amber-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">Top Performer Today</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg font-black">{overview.topPerformerToday.employeeName}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {overview.topPerformerToday.employeeRole} · {overview.topPerformerToday.department}
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <MetricBadge label="Patients" value={overview.topPerformerToday.patientsSeen} color="blue" />
                            <MetricBadge label="Efficiency" value={`${overview.topPerformerToday.efficiencyScore}%`} color="emerald" />
                            <MetricBadge label="Notes" value={overview.topPerformerToday.clinicalNotesWritten} color="purple" />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Busiest Dept + Workload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Busiest Department */}
                <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Busiest Department</h3>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                            <Building className="h-7 w-7 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xl font-black">{overview.busiestDepartment}</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Highest patient volume today</p>
                        </div>
                    </div>
                </div>

                {/* Workload Distribution */}
                <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Workload Distribution</h3>
                    <div className="space-y-3">
                        {workload.slice(0, 5).map((w: any) => (
                            <div key={w.department} className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">{w.department}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-gray-600">{w.totalEncounters} encounters</span>
                                    <span className="text-[10px] text-blue-400 font-bold">{w.activeEncounters} active</span>
                                    <span className="text-[10px] text-gray-500">{w.loadPerStaff} / staff</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StaffTab({
    staff,
    departments,
    selectedDepartment,
    onDepartmentChange,
}: {
    staff: StaffCardData[];
    departments: string[];
    selectedDepartment: string;
    onDepartmentChange: (dept: string) => void;
}) {
    return (
        <div className="space-y-4">
            {/* Department Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => onDepartmentChange('all')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                        selectedDepartment === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800/60 text-gray-500'
                    }`}
                >
                    All ({staff.length})
                </button>
                {departments.map((dept: any) => (
                    <button
                        key={dept}
                        onClick={() => onDepartmentChange(dept)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                            selectedDepartment === dept ? 'bg-blue-600 text-white' : 'bg-gray-800/60 text-gray-500'
                        }`}
                    >
                        {dept} ({staff.filter((s: any) => s.department === dept).length})
                    </button>
                ))}
            </div>

            {/* Staff Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((emp: any) => (
                    <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/40 hover:border-gray-700/50 transition-colors"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                    emp.isOnDuty ? 'bg-emerald-500/20' : 'bg-gray-700/30'
                                }`}>
                                    <Stethoscope className={`h-5 w-5 ${emp.isOnDuty ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-black">{emp.firstName} {emp.lastName}</p>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{emp.role}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                emp.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : emp.status === 'ON_LEAVE'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-gray-500/10 text-gray-500'
                            }`}>
                                {emp.isOnDuty ? 'On Duty' : emp.status}
                            </span>
                        </div>

                        {/* Department */}
                        <p className="text-[10px] text-gray-500 font-bold mb-3">{emp.department}</p>

                        {/* Today Metrics */}
                        {emp.todayMetrics && (
                            <div className="flex gap-3 pt-3 border-t border-gray-800/40">
                                <div className="flex-1 text-center">
                                    <p className="text-lg font-black text-blue-400">{emp.todayMetrics.patientsSeen}</p>
                                    <p className="text-[8px] text-gray-600 uppercase tracking-wider">Patients</p>
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-lg font-black text-amber-400">{emp.todayMetrics.activeEncounters}</p>
                                    <p className="text-[8px] text-gray-600 uppercase tracking-wider">Active</p>
                                </div>
                            </div>
                        )}

                        {/* Current Assignment */}
                        {emp.currentAssignment && (
                            <div className="mt-3 px-2 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                <p className="text-[10px] font-bold text-blue-400">
                                    {emp.currentAssignment.patientName
                                        ? `With: ${emp.currentAssignment.patientName}`
                                        : `Queue: ${emp.currentAssignment.queueNumber ?? 'N/A'}`}
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function DepartmentTab({ departments }: { departments: DepartmentPerformance[] }) {
    return (
        <div className="space-y-4">
            {departments.map((dept: any) => (
                <motion.div
                    key={dept.department}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-gray-900/30 border border-gray-800/40"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-blue-500" />
                            <h3 className="text-base font-black">{dept.department}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600">{dept.activeStaff}/{dept.totalStaff} active</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <DeptMetric label="Patients Seen" value={dept.patientsSeen} />
                        <DeptMetric label="Avg Consult" value={`${dept.avgConsultationMinutes}m`} />
                        <DeptMetric label="Encounters" value={dept.totalEncounters} />
                        <DeptMetric label="Messages" value={dept.totalChatMessages} />
                    </div>

                    {/* Top Performers */}
                    {dept.topPerformers.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Top Performers</p>
                            <div className="space-y-2">
                                {dept.topPerformers.slice(0, 3).map((perf: any, i: any) => (
                                    <div key={perf.employeeId} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/30">
                                        <div className="flex items-center gap-3">
                                            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                                                i === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                i === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                'bg-orange-600/20 text-orange-400'
                                            }`}>
                                                {i + 1}
                                            </span>
                                            <span className="text-sm font-bold">{perf.employeeName}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-[10px] text-gray-500">{perf.patientsSeen} patients</span>
                                            <span className="text-[10px] text-emerald-400 font-bold">{perf.efficiencyScore}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, subtext, color }: { icon: React.ElementType; label: string; value: string | number; subtext?: string; color: string }) {
    const colorClasses: Record<string, { bg: string; icon: string }> = {
        blue: { bg: 'bg-blue-500/10', icon: 'text-blue-500' },
        amber: { bg: 'bg-amber-500/10', icon: 'text-amber-500' },
        emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500' },
        purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500' },
    };
    const colors = colorClasses[color] ?? colorClasses.blue;

    return (
        <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
                    <Icon className={`h-4 w-4 ${colors.icon}`} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-black">{value}</p>
            {subtext && <p className="text-[9px] text-gray-600 font-bold mt-1">{subtext}</p>}
        </div>
    );
}

function MetricBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'text-blue-400',
        emerald: 'text-emerald-400',
        purple: 'text-purple-400',
    };
    return (
        <div className="text-center">
            <p className={`text-lg font-black ${colorClasses[color] ?? 'text-white'}`}>{value}</p>
            <p className="text-[8px] text-gray-600 uppercase tracking-wider">{label}</p>
        </div>
    );
}

function DeptMetric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="text-center p-3 rounded-xl bg-gray-800/30">
            <p className="text-lg font-black">{value}</p>
            <p className="text-[8px] text-gray-600 uppercase tracking-wider">{label}</p>
        </div>
    );
}
