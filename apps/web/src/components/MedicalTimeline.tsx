'use client';

import { api } from '@/trpc/client';
import { Stethoscope, MessageCircle, FileText, Activity, FlaskConical, Link2 } from 'lucide-react';
import { format } from 'date-fns';

export default function MedicalTimeline({ patientId }: { patientId: string }) {
    const { data: timelineEvents, isLoading, error } = api.communication.getTimeline.useQuery(
        { patientId, limit: 50 },
        { 
            refetchInterval: 10000 // In lieu of SSE currently pulling automatically
        }
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">Error loading timeline: {error.message}</div>;
    }

    if (!timelineEvents || timelineEvents.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 italic">
                No clinical history recorded yet.
            </div>
        );
    }

    const renderEventContent = (event: any) => {
        switch (event.type) {
            case 'NOTE':
                return (
                    <div className="space-y-4">
                        {event.metadata.soap.s && (
                            <div><span className="text-xs font-black uppercase text-gray-400">Subjective</span><p className="text-sm dark:text-gray-300 text-gray-700">{event.metadata.soap.s}</p></div>
                        )}
                        {event.metadata.soap.o && (
                            <div><span className="text-xs font-black uppercase text-gray-400">Objective</span><p className="text-sm dark:text-gray-300 text-gray-700">{event.metadata.soap.o}</p></div>
                        )}
                        {event.metadata.soap.a && (
                            <div><span className="text-xs font-black uppercase text-gray-400">Assessment</span><p className="text-sm dark:text-gray-300 text-gray-700">{event.metadata.soap.a}</p></div>
                        )}
                        {event.metadata.soap.p && (
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-800"><span className="text-xs font-black uppercase text-gray-400">Plan</span><p className="text-sm dark:text-gray-300 text-gray-700">{event.metadata.soap.p}</p></div>
                        )}
                        {event.content && !event.metadata.soap.s && <p className="text-sm">{event.content}</p>}
                    </div>
                );
            case 'CHAT':
                return (
                    <div>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{event.content}</p>
                        {event.metadata.attachments && event.metadata.attachments.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                {event.metadata.attachments.map((att: any) => (
                                    att.type === 'image' ? (
                                        <img key={att.id} src={att.url} alt="Clinical Attachment" className="rounded-xl w-full h-32 object-cover border border-gray-200 dark:border-gray-800" />
                                    ) : (
                                        <div key={att.id} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                            <Link2 className="h-4 w-4 text-emerald-500" />
                                            <span className="text-xs font-bold truncate">{att.fileName}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'VITALS':
                return (
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">BP</span>
                            <span className="text-lg font-black dark:text-white">{event.metadata.bp || '--'}</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                            <span className="text-[10px] uppercase font-black tracking-widest text-red-500">HR</span>
                            <span className="text-lg font-black dark:text-white">{event.metadata.hr || '--'}</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <span className="text-[10px] uppercase font-black tracking-widest text-blue-500">TEMP</span>
                            <span className="text-lg font-black dark:text-white">{event.metadata.temp || '--'}</span>
                        </div>
                    </div>
                );
            case 'LAB':
                return (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-400">{event.content}</p>
                        <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">{event.metadata.testCount} biomarkers resulted</p>
                    </div>
                );
            default:
                return <p className="text-sm text-gray-500">{event.content}</p>;
        }
    };

    const getEventStyles = (type: string) => {
        switch (type) {
            case 'NOTE': return { bg: 'bg-indigo-500', icon: FileText, label: 'Clinical Note' };
            case 'CHAT': return { bg: 'bg-emerald-500', icon: MessageCircle, label: 'Communication' };
            case 'VITALS': return { bg: 'bg-rose-500', icon: Activity, label: 'Vitals Recorded' };
            case 'LAB': return { bg: 'bg-purple-500', icon: FlaskConical, label: 'Lab Result' };
            default: return { bg: 'bg-gray-500', icon: Stethoscope, label: 'Event' };
        }
    };

    return (
        <div className="p-6 space-y-6">
            {timelineEvents.map((event: any, idx: number) => {
                const styles = getEventStyles(event.type);
                const Icon = styles.icon;
                
                return (
                    <div key={event.id} className="relative pl-8 pb-8 last:pb-0 group">
                        {idx !== timelineEvents.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
                        )}
                        <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full flex items-center justify-center text-white shadow-md ${styles.bg}`}>
                            <Icon className="h-3 w-3" />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${styles.bg.replace('bg-', 'text-')}`}>
                                    {event.metadata?.type || styles.label}
                                </span>
                                <h3 className="text-lg font-bold mt-0.5">{format(new Date(event.date), 'MMM do, yyyy • HH:mm')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
                                    {event.authorRole ? `${event.authorRole} ` : ''}{event.author && `• ${event.author}`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 p-4 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm transition-all group-hover:border-gray-300 dark:group-hover:border-gray-700">
                            {renderEventContent(event)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
