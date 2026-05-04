'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Filter,
  Search,
  Clock,
  User,
  FileText,
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  BarChart3,
  Eye,
  Calendar,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { SystemEvent, EventType, EventDomain, EventSeverity, EventStoreQuery } from '@/lib/event-system/types';
import { getEventLog, getEventStats, getPatientTimeline, EventLogEntry, EventStats } from '@/lib/event-system/event-log-actions';

interface EventLogPanelProps {
  tenantId?: string;
  patientId?: string;
  compact?: boolean;
}

const DOMAIN_COLORS: Record<EventDomain, string> = {
  PATIENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  TRIAGE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ENCOUNTER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LAB: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  RADIOLOGY: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  PHARMACY: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  BILLING: 'bg-green-500/10 text-green-400 border-green-500/20',
  INVENTORY: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  HR: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  ADT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  ICU: 'bg-red-500/10 text-red-400 border-red-500/20',
  SURGERY: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  MATERNITY: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  ONCOLOGY: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  SYSTEM: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const SEVERITY_ICONS: Record<EventSeverity, React.ReactNode> = {
  INFO: <CheckCircle2 className="h-3 w-3 text-blue-400" />,
  WARNING: <AlertTriangle className="h-3 w-3 text-amber-400" />,
  ERROR: <XCircle className="h-3 w-3 text-red-400" />,
  CRITICAL: <AlertCircle className="h-3 w-3 text-red-500" />,
};

export function EventLogPanel({ tenantId, patientId, compact }: EventLogPanelProps) {
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<EventDomain | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<EventSeverity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(!compact);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const query: EventStoreQuery = {
      tenantId: tenantId || 'default',
      limit: compact ? 20 : 50,
      orderBy: 'occurredAt',
      orderDir: 'desc',
    };

    if (patientId) {
      const timeline = await getPatientTimeline(query.tenantId, patientId, query.limit);
      setEvents(timeline);
    } else {
      const result = await getEventLog(query);
      setEvents(result.events);
    }

    if (!compact) {
      const statsData = await getEventStats(query.tenantId);
      setStats(statsData);
    }

    setLoading(false);
  }, [tenantId, patientId, compact]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredEvents = events.filter((event: any) => {
    if (selectedDomain !== 'ALL' && event.domain !== selectedDomain) return false;
    if (selectedSeverity !== 'ALL' && event.severity !== selectedSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        event.type.toLowerCase().includes(q) ||
        event.entityType.toLowerCase().includes(q) ||
        event.entityId.toLowerCase().includes(q) ||
        event.actorName?.toLowerCase().includes(q) ||
        JSON.stringify(event.payload).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const domains: (EventDomain | 'ALL')[] = ['ALL', 'PATIENT', 'ENCOUNTER', 'LAB', 'PHARMACY', 'BILLING', 'INVENTORY', 'ADT', 'ICU', 'SURGERY', 'MATERNITY'];
  const severities: (EventSeverity | 'ALL')[] = ['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] font-black uppercase text-gray-500">Recent Events</span>
          </div>
          <span className="text-[9px] font-bold text-gray-600">{filteredEvents.length} events</span>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredEvents.slice(0, 10).map((event: any) => (
            <div
              key={event.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 hover:border-gray-700 transition-all cursor-pointer"
              onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
            >
              {SEVERITY_ICONS[event.severity as EventSeverity]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${DOMAIN_COLORS[event.domain as EventDomain]}`}>
                    {event.domain}
                  </span>
                  <span className="text-[10px] font-bold text-white truncate">{event.type}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] text-gray-600">{event.entityType}:{event.entityId.slice(0, 8)}</span>
                  <span className="text-[8px] text-gray-700">•</span>
                  <span className="text-[8px] text-gray-600">
                    {new Date(event.occurredAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#07070a] text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-500" />
            <h2 className="text-sm font-black uppercase tracking-widest">Event Log</h2>
            <span className="text-[10px] font-bold text-gray-600 bg-gray-900 px-2 py-0.5 rounded-full">{filteredEvents.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              title="Toggle Statistics"
              aria-label="Toggle Statistics"
              className={`p-2 rounded-lg border transition-all ${showStats ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle Filters"
              aria-label="Toggle Filters"
              className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              onClick={fetchData}
              title="Refresh Events"
              aria-label="Refresh Events"
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-500 hover:text-white transition-all"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-3 border-b border-gray-800/30 overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search events, entities, actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[9px] font-black text-gray-600 uppercase mb-1 block">Domain</label>
                <div className="flex flex-wrap gap-1">
                  {domains.map((d: any) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDomain(d)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-md border transition-all ${
                        selectedDomain === d
                          ? d === 'ALL'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : DOMAIN_COLORS[d as EventDomain]
                          : 'bg-transparent border-gray-800 text-gray-600 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[9px] font-black text-gray-600 uppercase mb-1 block">Severity</label>
                <div className="flex gap-1">
                  {severities.map((s: any) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeverity(s)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-md border transition-all ${
                        selectedSeverity === s
                          ? s === 'ALL'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : s === 'CRITICAL'
                            ? 'bg-red-500/20 border-red-500/40 text-red-400'
                            : s === 'ERROR'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : s === 'WARNING'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-transparent border-gray-800 text-gray-600 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && stats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 border-b border-gray-800/30 overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-3">
                <div className="text-[9px] font-black text-gray-600 uppercase">Total (24h)</div>
                <div className="text-2xl font-black text-white">{stats.totalEvents}</div>
              </div>
              <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-3">
                <div className="text-[9px] font-black text-gray-600 uppercase">Critical</div>
                <div className="text-2xl font-black text-red-500">{stats.bySeverity.find((s: any) => s.severity === 'CRITICAL')?.count ?? 0}</div>
              </div>
              <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-3">
                <div className="text-[9px] font-black text-gray-600 uppercase">Domains</div>
                <div className="text-2xl font-black text-blue-500">{stats.byDomain.length}</div>
              </div>
              <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-3">
                <div className="text-[9px] font-black text-gray-600 uppercase">Peak Hour</div>
                <div className="text-sm font-black text-emerald-500">
                  {stats.byHour.length > 0 ? stats.byHour.reduce((a: any, b: any) => a.count > b.count ? a : b).hour.slice(-5) : '--:--'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[9px] font-black text-gray-600 uppercase mb-2">Events by Domain</h4>
                <div className="space-y-1">
                  {stats.byDomain.slice(0, 5).map(({ domain, count }) => (
                    <div key={domain} className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DOMAIN_COLORS[domain as EventDomain]}`}>{domain}</span>
                      <span className="text-[10px] font-mono text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[9px] font-black text-gray-600 uppercase mb-2">Events by Severity</h4>
                <div className="space-y-1">
                  {stats.bySeverity.map(({ severity, count }) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {SEVERITY_ICONS[severity as EventSeverity]}
                        <span className="text-[10px] font-bold text-gray-400">{severity}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-12 w-12 text-gray-700 mb-4" />
            <h3 className="text-sm font-black text-gray-600 uppercase">No Events Found</h3>
            <p className="text-[11px] text-gray-700 mt-1">Adjust filters or wait for new events</p>
          </div>
        ) : (
          filteredEvents.map((event: any) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border transition-all cursor-pointer ${
                expandedEvent === event.id
                  ? 'bg-gray-900/60 border-gray-700'
                  : 'bg-gray-900/30 border-gray-800/50 hover:border-gray-700'
              }`}
              onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
            >
              <div className="flex items-center gap-3 p-3">
                {SEVERITY_ICONS[event.severity as EventSeverity]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${DOMAIN_COLORS[event.domain as EventDomain]}`}>
                      {event.domain}
                    </span>
                    <span className="text-[11px] font-bold text-white">{event.type}</span>
                    {event.correlationId && (
                      <span className="text-[8px] font-mono text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded">
                        corr:{event.correlationId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[9px] text-gray-600">
                      <FileText className="h-2.5 w-2.5" />
                      {event.entityType}:{event.entityId.slice(0, 8)}
                    </span>
                    {event.patientId && (
                      <span className="flex items-center gap-1 text-[9px] text-gray-600">
                        <User className="h-2.5 w-2.5" />
                        {event.patientId.slice(0, 8)}
                      </span>
                    )}
                    {event.actorName && (
                      <span className="flex items-center gap-1 text-[9px] text-gray-600">
                        <User className="h-2.5 w-2.5" />
                        {event.actorName}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[9px] text-gray-700 ml-auto">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(event.occurredAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {expandedEvent === event.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-600 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600 shrink-0" />
                )}
              </div>

              <AnimatePresence>
                {expandedEvent === event.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-1 border-t border-gray-800/50">
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <span className="font-black text-gray-600 uppercase">Event ID</span>
                          <p className="font-mono text-gray-400 mt-0.5 break-all">{event.id}</p>
                        </div>
                        <div>
                          <span className="font-black text-gray-600 uppercase">Entity</span>
                          <p className="font-mono text-gray-400 mt-0.5">{event.entityType} / {event.entityId}</p>
                        </div>
                        {event.encounterId && (
                          <div>
                            <span className="font-black text-gray-600 uppercase">Encounter</span>
                            <p className="font-mono text-gray-400 mt-0.5">{event.encounterId}</p>
                          </div>
                        )}
                        {event.correlationId && (
                          <div>
                            <span className="font-black text-gray-600 uppercase">Correlation ID</span>
                            <p className="font-mono text-gray-400 mt-0.5">{event.correlationId}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <span className="font-black text-gray-600 uppercase text-[10px]">Payload</span>
                        <pre className="mt-1 p-3 bg-black/40 border border-gray-800 rounded-lg text-[10px] text-gray-400 font-mono overflow-x-auto max-h-32">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
