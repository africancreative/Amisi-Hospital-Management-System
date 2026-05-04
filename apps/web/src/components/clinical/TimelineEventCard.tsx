'use client';

import { motion } from 'framer-motion';
import {
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
    ChevronRight,
    AlertCircle,
} from 'lucide-react';
import { TimelineEvent, EVENT_TYPE_CONFIG, EventCategory } from '@/lib/timeline-types';

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

interface TimelineEventCardProps {
    event: TimelineEvent;
    onClick?: () => void;
    compact?: boolean;
}

/**
 * Renders metadata based on event category for rich contextual display.
 */
function EventMetadata({ event, compact }: { event: TimelineEvent; compact: boolean }) {
    const category = event.category as EventCategory;
    const description = event.description ?? '';

    if (compact) return null;

    const renderContent = () => {
        switch (category) {
            case 'CONSULTATION':
                return (
                    <div className="mt-2 space-y-1">
                        {description ? (
                            <p className="text-[11px] text-gray-400 italic">{description}</p>
                        ) : null}
                    </div>
                );

            case 'PRESCRIPTION':
                return (
                    <div className="mt-2">
                        {description ? (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                                <Pill className="h-3 w-3 text-emerald-500" />
                                <span className="text-[11px] font-bold text-emerald-400">{description}</span>
                            </div>
                        ) : null}
                    </div>
                );

            case 'LAB':
                return (
                    <div className="mt-2 space-y-1.5">
                        {description ? (
                            <p className="text-[11px] font-bold text-purple-400">{description}</p>
                        ) : null}
                    </div>
                );

            case 'QUEUE':
                return (
                    <div className="mt-2 flex items-center gap-2">
                        {description ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400">
                                {description}
                            </span>
                        ) : null}
                    </div>
                );

            case 'CHAT':
                return (
                    <div className="mt-2 px-2 py-1.5 rounded-md bg-cyan-500/5 border border-cyan-500/10">
                        <p className="text-[11px] text-gray-400 line-clamp-2">{description}</p>
                    </div>
                );

            case 'VITALS':
                return (
                    <div className="mt-2">
                        {description ? (
                            <p className="text-[11px] text-gray-400">{description}</p>
                        ) : null}
                    </div>
                );

            default:
                return null;
        }
    };

    return renderContent();
}

export function TimelineEventCard({ event, onClick, compact = false }: TimelineEventCardProps) {
    const category = event.category as EventCategory;
    const config = EVENT_TYPE_CONFIG[category];
    const Icon = ICON_MAP[config.icon];

    const timeStr = new Date(event.occurredAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                onClick={onClick}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
            >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${config.bgColor}`}>
                    <Icon className={`h-3 w-3 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-400 truncate">{event.title}</p>
                </div>
                <span className="text-[9px] text-gray-700 shrink-0">{timeStr}</span>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.002 }}
            onClick={onClick}
            className={`group relative pl-6 pr-4 py-3 rounded-xl border cursor-pointer transition-all ${
                `bg-gray-900/20 border-gray-800/40 hover:border-gray-700/50 ${config.bgColor.replace('/10', '/5')}`
            }`}
        >
            {/* Timeline dot */}
            <div className={`absolute left-0 top-4 h-2.5 w-2.5 rounded-full ring-4 ring-gray-950 ${config.color.replace('text-', 'bg-')}`} />

            {/* Header row */}
            <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor} border ${config.borderColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-gray-200">{event.title}</h4>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-gray-600">{timeStr}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Actor info */}
                    <div className="mt-0.5 flex items-center gap-2">
                        {event.actorName ? (
                            <>
                                <span className="text-[10px] font-bold text-gray-500">{event.actorName}</span>
                                {event.actorRole ? (
                                    <>
                                        <span className="text-[9px] text-gray-700">·</span>
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${config.color} opacity-60`}>
                                            {event.actorRole}
                                        </span>
                                    </>
                                ) : null}
                            </>
                        ) : null}
                    </div>

                    {/* Description */}
                    {event.description ? (
                        <p className="mt-1.5 text-[11px] text-gray-500 leading-relaxed">{event.description}</p>
                    ) : null}

                    {/* Category-specific metadata */}
                    <EventMetadata event={event} compact={compact} />
                </div>
            </div>
        </motion.div>
    );
}
