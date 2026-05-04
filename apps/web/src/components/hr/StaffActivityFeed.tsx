'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Users,
    Stethoscope,
    MessageSquare,
    Clock,
    Filter,
    X,
    Search,
    Building,
    User,
    Calendar,
} from 'lucide-react';
import { getStaffActivity } from '@/lib/staff-tracking-actions';
import { StaffActivityEntry, ActivityCategory, CATEGORY_ACTIVITIES, ACTIVITY_CATEGORY } from '@/lib/staff-tracking-types';

interface StaffActivityFeedProps {
    employeeId?: string;
    compact?: boolean;
}

const CATEGORY_CONFIG: Record<ActivityCategory, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
    QUEUE: { icon: Users, color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Queue' },
    CLINICAL: { icon: Stethoscope, color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Clinical' },
    DIAGNOSTICS: { icon: Activity, color: 'text-purple-400', bgColor: 'bg-purple-500/10', label: 'Diagnostics' },
    PHARMACY: { icon: Clock, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Pharmacy' },
    COMMUNICATION: { icon: MessageSquare, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', label: 'Communication' },
    ADMINISTRATIVE: { icon: Calendar, color: 'text-gray-400', bgColor: 'bg-gray-500/10', label: 'Admin' },
};

export function StaffActivityFeed({ employeeId, compact = false }: StaffActivityFeedProps) {
    const [activities, setActivities] = useState<StaffActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<ActivityCategory[]>([]);
    const [department, setDepartment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        const filters: { employeeId?: string; categories?: ActivityCategory[]; department?: string } = {};
        if (employeeId) filters.employeeId = employeeId;
        if (selectedCategories.length > 0) filters.categories = selectedCategories;
        if (department) filters.department = department;

        const result = await getStaffActivity(filters);
        setActivities(result.slice(0, compact ? 20 : 100));
        setLoading(false);
    }, [employeeId, selectedCategories, department, compact]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const toggleCategory = (cat: ActivityCategory) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c: any) => c !== cat) : [...prev, cat]
        );
    };

    const filtered = searchQuery
        ? activities.filter(
              (a) =>
                  a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (a.patientName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
          )
        : activities;

    if (compact) {
        return (
            <div className="h-full flex flex-col">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-1 p-2">
                        {filtered.map((activity: any) => (
                            <CompactActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800/50 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-black tracking-tight">Staff Activity Feed</h2>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white text-xs font-bold"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search staff, patients, actions..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-900/60 border border-gray-800/60 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/40"
                    />
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="px-6 py-4 border-b border-gray-800/50 shrink-0 space-y-3">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Categories</label>
                        <div className="flex flex-wrap gap-1.5">
                            {Object.entries(ACTIVITY_CATEGORY).map(([key, cat]) => {
                                const config = CATEGORY_CONFIG[cat];
                                const Icon = config.icon;
                                const isActive = selectedCategories.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => toggleCategory(cat)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                            isActive
                                                ? `${config.bgColor} ${config.color} border border-gray-700/50`
                                                : 'bg-gray-800/40 text-gray-600'
                                        }`}
                                    >
                                        <Icon className="h-3 w-3" />
                                        {config.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Department</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Filter by department..."
                            className="w-full px-3 py-1.5 bg-gray-900/60 border border-gray-800/60 rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/40"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setSelectedCategories([]);
                            setDepartment('');
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-300"
                    >
                        <X className="h-3 w-3" />
                        Clear filters
                    </button>
                </div>
            )}

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2">
                        <Activity className="h-8 w-8 text-gray-700" />
                        <p className="text-sm font-bold text-gray-600">No activity recorded</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((activity: any) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ActivityItem({ activity }: { activity: StaffActivityEntry }) {
    const config = CATEGORY_CONFIG[activity.category];
    const Icon = config.icon;
    const timeStr = new Date(activity.completedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-gray-900/20 border border-gray-800/30 hover:border-gray-700/40 transition-colors"
        >
            {/* Icon */}
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-gray-200 truncate">{activity.title}</h4>
                    <span className="text-[10px] text-gray-600 shrink-0">{timeStr}</span>
                </div>

                <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {activity.employeeName}
                    </span>
                    <span className="text-[9px] text-gray-700">·</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${config.color} opacity-60`}>
                        {activity.employeeRole}
                    </span>
                    {activity.department ? (
                        <>
                            <span className="text-[9px] text-gray-700">·</span>
                            <span className="text-[9px] text-gray-500 flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {activity.department}
                            </span>
                        </>
                    ) : null}
                </div>

                {/* Patient/Queue info */}
                {(activity.patientName || activity.queueNumber) && (
                    <div className="mt-1.5 flex items-center gap-2">
                        {activity.patientName && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-[9px] font-bold text-blue-400">
                                Patient: {activity.patientName}
                            </span>
                        )}
                        {activity.queueNumber && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[9px] font-bold text-amber-400">
                                {activity.queueNumber}
                            </span>
                        )}
                    </div>
                )}

                {/* Duration */}
                {activity.durationSeconds && activity.durationSeconds > 0 && (
                    <span className="mt-1 inline-block text-[9px] text-gray-600 font-bold">
                        Duration: {Math.round(activity.durationSeconds / 60)}m
                    </span>
                )}

                {/* Description */}
                {activity.description && (
                    <p className="mt-1 text-[10px] text-gray-600 line-clamp-2">{activity.description}</p>
                )}
            </div>
        </motion.div>
    );
}

function CompactActivityItem({ activity }: { activity: StaffActivityEntry }) {
    const config = CATEGORY_CONFIG[activity.category];
    const Icon = config.icon;
    const timeStr = new Date(activity.completedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/30 transition-colors">
            <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${config.bgColor}`}>
                <Icon className={`h-3 w-3 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 truncate">{activity.title}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] text-gray-600">{activity.employeeName}</span>
                <span className="text-[8px] text-gray-700">{timeStr}</span>
            </div>
        </div>
    );
}
