'use client';

import React, { useState } from 'react';
import { 
    Plus, Users, Activity, TrendingUp, DollarSign, Microscope, Pill, 
    Stethoscope, Clock, AlertTriangle, Package, FileText, UserPlus,
    Download, ChevronRight, Wallet, Smartphone, CreditCard,
    AlertCircle, TrendingDown, Timer, BarChart3
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const STATUS_COLORS: any = {
    waiting: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Waiting' },
    consultation: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Consultation' },
    lab: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', label: 'Lab' },
    pharmacy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Pharmacy' },
};

const PAYMENT_METHODS = [
    { key: 'CASH', label: 'Cash', icon: Wallet, color: 'text-emerald-400' },
    { key: 'MPESA', label: 'M-Pesa', icon: Smartphone, color: 'text-green-400' },
    { key: 'CARD', label: 'Card', icon: CreditCard, color: 'text-blue-400' },
];

export function TenantDashboard({ stats, slug, userRole, initialDate }: { stats: any, slug: string, userRole: string, initialDate?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [showExport, setShowExport] = useState(false);

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        const params = new URLSearchParams(searchParams.toString());
        if (newDate) {
            params.set('date', newDate);
        } else {
            params.delete('date');
        }
        router.push(`/${slug}?${params.toString()}`);
    };

    const queueBreakdown = stats.queueBreakdown || { waiting: 0, consultation: 0, lab: 0, pharmacy: 0 };
    const staffActivity = stats.staffActivity || { activeStaff: 0, encountersPerStaff: [], avgConsultTime: 0 };
    const alerts = stats.alerts || { overcrowding: false, lowInventoryCount: 0, delayedPatients: 0 };
    const revenueByMethod = stats.revenueByMethod || {};

    const topBarMetrics = [
        { label: "Patients Today", value: stats.patientsToday ?? stats.todayEncounters, icon: Users, color: "text-blue-400" },
        { label: "Revenue Today", value: stats.revenueToday ?? 'KES 0', icon: DollarSign, color: "text-emerald-400" },
        { label: "Active Queue", value: stats.activeQueue ?? 0, icon: Activity, color: "text-amber-400" },
        { label: "Pending Payments", value: stats.pendingPayments ?? 0, icon: Clock, color: "text-rose-400" },
    ];

    const quickActions = [
        { icon: Plus, label: "Register Patient", href: `/${slug}/patients`, color: "blue" },
        { icon: UserPlus, label: "Add Staff", href: `/${slug}/hr`, color: "amber" },
        { icon: FileText, label: "View Reports", href: `/${slug}/reports`, color: "indigo" },
    ];

    const alertItems = [
        {
            show: alerts.overcrowding,
            icon: AlertTriangle,
            title: "Overcrowding Alert",
            desc: `${stats.activeQueue} patients in queue exceeds threshold`,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        },
        {
            show: alerts.lowInventoryCount > 0,
            icon: Package,
            title: "Low Inventory",
            desc: `${alerts.lowInventoryCount} items below reorder level`,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            show: alerts.delayedPatients > 0,
            icon: Timer,
            title: "Delayed Patients",
            desc: `${alerts.delayedPatients} patients waiting >30 min`,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        }
    ].filter(a => a.show);

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0b]">
            <div className="mx-auto max-w-7xl p-6 lg:p-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Hospital Dashboard</h1>
                        <p className="text-neutral-500 mt-1">
                            Operations for <span className="text-amber-500 font-bold uppercase">{slug.replace('-', ' ')}</span>.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        />
                        <button
                            onClick={() => setShowExport(!showExport)}
                            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:border-white/20 transition-all"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                        <Link href={`/${slug}/patients`} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all">
                            <Plus className="h-4 w-4" />
                            Register Patient
                        </Link>
                    </div>
                </header>

                {/* Export Panel */}
                {showExport && (
                    <div className="mb-6 rounded-2xl border border-white/10 bg-neutral-900/80 p-4 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-neutral-400" />
                            <span className="text-sm text-neutral-300">Export Report as:</span>
                            <button className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/20 hover:bg-blue-500/20">CSV</button>
                            <button className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">PDF</button>
                            <button className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/20">Excel</button>
                        </div>
                    </div>
                )}

                {/* Top Bar Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {topBarMetrics.map((m, i) => (
                        <div key={i} className="rounded-2xl border border-white/5 bg-neutral-900/50 p-4 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{m.label}</p>
                                <m.icon className={`h-4 w-4 ${m.color}`} />
                            </div>
                            <p className="text-2xl font-black text-white">{m.value}</p>
                        </div>
                    ))}
                </div>

                {/* SECTION 1: Live Operations */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">Live Operations</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { key: 'waiting', value: queueBreakdown.waiting, ...STATUS_COLORS.waiting },
                            { key: 'consultation', value: queueBreakdown.consultation, ...STATUS_COLORS.consultation },
                            { key: 'lab', value: queueBreakdown.lab, ...STATUS_COLORS.lab },
                            { key: 'pharmacy', value: queueBreakdown.pharmacy, ...STATUS_COLORS.pharmacy },
                        ].map((item) => (
                            <Link key={item.key} href={`/${slug}/queue`} className={`rounded-2xl border ${item.border} ${item.bg} p-5 backdrop-blur-xl hover:scale-[1.02] transition-all group`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${item.text}`}>{item.label}</span>
                                    <ChevronRight className={`h-4 w-4 ${item.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                </div>
                                <p className={`text-3xl font-black ${item.text}`}>{item.value}</p>
                                <p className="text-[10px] text-neutral-500 mt-1">Patients</p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* SECTION 2: Revenue Snapshot */}
                    <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-neutral-900/50 p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <DollarSign className="h-5 w-5 text-emerald-400" />
                            <h2 className="text-lg font-bold text-white">Revenue Snapshot</h2>
                        </div>
                        <div className="mb-6">
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Today's Revenue</p>
                            <p className="text-3xl font-black text-emerald-400">{stats.revenueToday ?? 'KES 0'}</p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs text-neutral-500 uppercase tracking-wider">Payments by Method</p>
                            {PAYMENT_METHODS.map(({ key, label, icon: Icon, color }) => {
                                const amount = revenueByMethod[key] || 0;
                                const total = (Object.values(revenueByMethod) as number[]).reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                                return (
                                    <div key={key} className="flex items-center gap-3">
                                        <Icon className={`h-4 w-4 ${color}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-300">{label}</span>
                                                <span className="text-white font-bold">KES {amount.toLocaleString()}</span>
                                            </div>
                                            <div className="mt-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                                                <div className={`h-full rounded-full ${color.replace('text', 'bg')}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 3: Staff Activity */}
                    <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-neutral-900/50 p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="h-5 w-5 text-blue-400" />
                            <h2 className="text-lg font-bold text-white">Staff Activity</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Active Staff</p>
                                <p className="text-3xl font-black text-blue-400">{staffActivity.activeStaff}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Patients per Staff</p>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {staffActivity.encountersPerStaff.length > 0 ? (
                                        staffActivity.encountersPerStaff.slice(0, 5).map((s: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-neutral-400">{s.staffId?.substring(0, 8) || 'Unknown'}</span>
                                                <span className="text-white font-bold">{s.count}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-neutral-600 italic">No data today</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Avg Consult Time</p>
                                <p className="text-xl font-bold text-amber-400">{staffActivity.avgConsultTime} min</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Alerts */}
                    <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-neutral-900/50 p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <AlertCircle className="h-5 w-5 text-rose-400" />
                            <h2 className="text-lg font-bold text-white">Alerts</h2>
                        </div>
                        {alertItems.length > 0 ? (
                            <div className="space-y-3">
                                {alertItems.map((alert, i) => (
                                    <div key={i} className={`rounded-xl border ${alert.border} ${alert.bg} p-4`}>
                                        <div className="flex items-start gap-3">
                                            <alert.icon className={`h-5 w-5 ${alert.color} mt-0.5 shrink-0`} />
                                            <div>
                                                <p className={`text-sm font-bold ${alert.color}`}>{alert.title}</p>
                                                <p className="text-xs text-neutral-500 mt-0.5">{alert.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 gap-2">
                                <AlertCircle className="h-8 w-8 text-neutral-700" />
                                <p className="text-sm text-neutral-600">All clear, no active alerts</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 5: Quick Actions */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-amber-400" />
                        <h2 className="text-lg font-bold text-white">Quick Actions</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {quickActions.map(({ icon: Icon, label, href, color }, i) => {
                            const colors: any = {
                                blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
                                amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
                                indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20",
                            };
                            return (
                                <Link key={i} href={href} className={`flex items-center gap-4 p-5 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] ${colors[color]}`}>
                                    <Icon className="h-6 w-6" />
                                    <span className="font-bold text-lg">{label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Stats (existing) */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Patients" value={stats.patientCount} icon={Users} trend="Active Records" color="blue" />
                    <StatCard title="Today's Encounters" value={stats.todayEncounters} icon={Activity} trend="Rising" color="rose" />
                    <StatCard title="Pending Labs" value={stats.pendingLabs} icon={Microscope} trend="Action Required" color="amber" />
                    <StatCard title="Hospital Revenue" value={stats.totalRevenue} icon={DollarSign} trend="Calculated" color="emerald" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend, color }: { title: string; value: string; icon: any; trend: string; color: string; }) {
    const bgColors: any = {
        blue: "bg-blue-500/10 text-blue-400",
        emerald: "bg-emerald-500/10 text-emerald-400",
        amber: "bg-amber-500/10 text-amber-400",
        rose: "bg-rose-500/10 text-rose-400",
        indigo: "bg-indigo-500/10 text-indigo-400",
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-neutral-900/50 p-5 backdrop-blur-xl flex flex-col justify-between group transition-all hover:border-white/10">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">{title}</p>
                <div className={`p-2.5 rounded-xl ${bgColors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="mt-4">
                <p className="text-2xl font-black text-white">{value}</p>
                <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <p className="text-[10px] font-medium text-neutral-500">{trend}</p>
                </div>
            </div>
        </div>
    );
}
