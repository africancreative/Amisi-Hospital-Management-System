'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Filter,
    X,
    Search,
    Calendar,
    ChevronDown,
    AlertCircle,
    Stethoscope,
    Pill,
    FlaskConical,
    Scan,
    MessageSquare,
    ListOrdered,
    Heart,
    CircleArrowRight,
    CircleArrowLeft,
    AlertTriangle,
    ClipboardList,
    FileText,
    Scissors,
    Baby,
    Activity,
    CreditCard,
    Settings,
} from 'lucide-react';
import { getPatientTimeline } from '@/lib/timeline-actions';
import {
    EVENT_CATEGORY,
    EVENT_TYPE_CONFIG,
    QUICK_FILTERS,
    TimelineEvent,
    TimelineGroup,
    TimelineFilters,
    EventCategory,
} from '@/lib/timeline-types';
import { TimelineEventCard } from './TimelineEventCard';

// Map icon names to actual components
const ICON_MAP: Record<string, React.ElementType> = {
    Stethoscope,
    Pill,
    FlaskConical,
    Scan,
    MessageSquare,
    ListOrdered,
    Heart,
    CircleArrowRight,
    CircleArrowLeft,
    AlertTriangle,
    ClipboardList,
    FileText,
    Scissors,
    Baby,
    Activity,
    CreditCard,
    Settings,
};

interface MedicalTimelineProps {
    patientId: string;
    initialFilters?: TimelineFilters;
    onEventSelect?: (event: TimelineEvent) => void;
    compact?: boolean;
}

const CATEGORY_OPTIONS = Object.entries(EVENT_CATEGORY).map(([key, value]) => ({
    value,
    label: EVENT_TYPE_CONFIG[value as EventCategory].label,
    color: EVENT_TYPE_CONFIG[value as EventCategory].color,
    bgColor: EVENT_TYPE_CONFIG[value as EventCategory].bgColor,
    borderColor: EVENT_TYPE_CONFIG[value as EventCategory].borderColor,
    icon: ICON_MAP[EVENT_TYPE_CONFIG[value as EventCategory].icon],
}));

export function MedicalTimeline({
    patientId,
    initialFilters,
    onEventSelect,
    compact = false,
}: MedicalTimelineProps) {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [groups, setGroups] = useState<TimelineGroup[]>([]);
    const [filters, setFilters] = useState<TimelineFilters>(initialFilters ?? {});
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [activeQuickFilter, setActiveQuickFilter] = useState<string>('ALL');

    const fetchTimeline = useCallback(async () => {
        setLoading(true);
        const result = await getPatientTimeline(patientId, filters);
        if (result.success) {
            setEvents(result.events as TimelineEvent[]);
            setGroups(result.groups as TimelineGroup[]);
        }
        setLoading(false);
    }, [patientId, filters]);

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    const applyQuickFilter = (key: string) => {
        setActiveQuickFilter(key);
        const preset = QUICK_FILTERS[key as keyof typeof QUICK_FILTERS];

        if (preset.categories.length === 0) {
            setFilters((prev) => ({ ...prev, categories: undefined }));
        } else {
            setFilters((prev) => ({ ...prev, categories: preset.categories }));
        }
    };

    const toggleCategory = (category: EventCategory) => {
        const current = filters.categories ?? [];
        const updated = current.includes(category)
            ? current.filter((c: any) => c !== category)
            : [...current, category];

        setFilters((prev) => ({
            ...prev,
            categories: updated.length > 0 ? updated : undefined,
        }));
        setActiveQuickFilter('');
    };

    const clearFilters = () => {
        setFilters({});
        setSearchQuery('');
        setDateFrom('');
        setDateTo('');
        setActiveQuickFilter('ALL');
    };

    const handleSearch = () => {
        setFilters((prev) => ({ ...prev, searchQuery }));
    };

    const activeFilterCount = [
        filters.categories?.length,
        filters.visitId ? 1 : 0,
        filters.encounterId ? 1 : 0,
        filters.actorRole ? 1 : 0,
        dateFrom || dateTo ? 1 : 0,
    ].filter(Boolean).length;

    if (compact) {
        return (
            <div className="h-full overflow-y-auto scrollbar-thin">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {events.slice(0, 20).map((event: any) => (
                            <TimelineEventCard
                                key={event.id}
                                event={event}
                                compact
                                onClick={() => onEventSelect?.(event)}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div className="px-6 py-4 border-b border-gray-800/50 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-black tracking-tight text-white">Medical Record Timeline</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {events.length} events
                        </span>
                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-black text-white flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ─── Quick Filters ──────────────────────────────────────── */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {Object.entries(QUICK_FILTERS).map(([key, preset]) => (
                        <button
                            key={key}
                            onClick={() => applyQuickFilter(key)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                activeQuickFilter === key
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                    : 'bg-gray-800/60 text-gray-500 hover:text-gray-300 hover:bg-gray-700/60'
                            }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* ─── Search ─────────────────────────────────────────────── */}
                <div className="mt-3 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search timeline..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-900/60 border border-gray-800/60 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            {/* ─── Filter Panel ────────────────────────────────────────── */}
            <AnimatePresence>
                {showFilterPanel && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-b border-gray-800/50 shrink-0"
                    >
                        <div className="px-6 py-4 space-y-4">
                            {/* Categories */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                    Categories
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {CATEGORY_OPTIONS.map((cat: any) => {
                                        const Icon = cat.icon;
                                        const isActive = filters.categories?.includes(cat.value as EventCategory);
                                        return (
                                            <button
                                                key={cat.value}
                                                onClick={() => toggleCategory(cat.value as EventCategory)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                                    isActive
                                                        ? `${cat.bgColor} ${cat.color} border ${cat.borderColor}`
                                                        : 'bg-gray-800/40 text-gray-600 hover:text-gray-400'
                                                }`}
                                            >
                                                <Icon className="h-3 w-3" />
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => {
                                            setDateFrom(e.target.value);
                                            setFilters((prev) => ({
                                                ...prev,
                                                dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                                            }));
                                        }}
                                        className="w-full px-3 py-1.5 bg-gray-900/60 border border-gray-800/60 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-blue-500/40"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => {
                                            setDateTo(e.target.value);
                                            setFilters((prev) => ({
                                                ...prev,
                                                dateTo: e.target.value ? new Date(e.target.value) : undefined,
                                            }));
                                        }}
                                        className="w-full px-3 py-1.5 bg-gray-900/60 border border-gray-800/60 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-blue-500/40"
                                    />
                                </div>
                            </div>

                            {/* Clear */}
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <X className="h-3 w-3" />
                                Clear all filters
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Timeline Content ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                            Loading timeline...
                        </span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2">
                        <Calendar className="h-8 w-8 text-gray-700" />
                        <p className="text-sm font-bold text-gray-600">No events recorded yet</p>
                        <p className="text-[11px] text-gray-700">Timeline events will appear as clinical actions occur</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-800/60" />

                        <div className="space-y-6">
                            {groups.map((group: any) => (
                                <div key={group.date}>
                                    {/* Date header */}
                                    <div className="relative mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-gray-950/50 z-10" />
                                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                {group.label}
                                            </h3>
                                            <div className="flex-1 h-px bg-gray-800/40" />
                                            <span className="text-[10px] font-bold text-gray-600">
                                                {group.events.length} event{group.events.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Events */}
                                    <div className="space-y-2 pl-4">
                                        {group.events.map((event: any) => (
                                            <TimelineEventCard
                                                key={event.id}
                                                event={event}
                                                onClick={() => onEventSelect?.(event)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
