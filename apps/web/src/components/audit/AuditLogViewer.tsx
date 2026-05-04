'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Eye,
  Edit3,
  Trash2,
  Download,
  AlertTriangle,
  Activity,
  Lock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BarChart3,
  Clock,
  Hash,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  department?: string | null;
  timestamp: string;
  prevHash?: string | null;
  hash?: string | null;
  chainPosition: string;
  category: string;
  severity: string;
  isRetained: boolean;
  recordChanges?: RecordChange[];
  chatActions?: ChatAction[];
  accessLogs?: AccessLog[];
}

interface RecordChange {
  id: string;
  entityType: string;
  entityId: string;
  changeType: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  changedFields: string[];
  actorId: string;
  actorName: string;
  timestamp: string;
}

interface ChatAction {
  id: string;
  messageId?: string;
  action: string;
  originalContent?: string;
  newContent?: string;
  actorId: string;
  actorName: string;
  timestamp: string;
}

interface AccessLog {
  id: string;
  resourceType: string;
  resourceId: string;
  patientId?: string;
  accessReason?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
}

interface AuditStats {
  totalEntries: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  chainVerified: boolean;
}

import { getAuditLog, verifyAuditChain as verifyChainAction } from '@/lib/audit-actions';

// ─── Server Actions ───────────────────────────────────────────────────────

async function fetchAuditLog(params: {
  limit?: number;
  offset?: number;
  actorId?: string;
  resource?: string;
  category?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ entries: AuditLogEntry[]; total: number }> {
  try {
    const result = await getAuditLog({
      limit: params.limit,
      offset: params.offset,
      actorId: params.actorId,
      resource: params.resource,
      category: params.category,
      severity: params.severity,
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
    });

    return {
      entries: result.entries.map((e: any) => ({
        ...e,
        chainPosition: e.chainPosition.toString(),
      })),
      total: result.total,
    };
  } catch (err) {
    console.error('[AuditLogViewer] Failed to fetch audit log:', err);
    return { entries: [], total: 0 };
  }
}

async function fetchAuditStats(): Promise<AuditStats> {
  try {
    const db = await (await import('@/lib/db')).getTenantDb();
    const [total, byCategory, bySeverity, lastEntry] = await Promise.all([
      db.auditLog.count(),
      db.auditLog.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
      db.auditLog.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),
      db.auditLog.findFirst({
        orderBy: { chainPosition: 'desc' },
        select: { chainPosition: true, hash: true, prevHash: true },
      }),
    ]);

    const chainVerified = lastEntry
      ? lastEntry.hash !== null && lastEntry.hash !== ''
      : true;

    return {
      totalEntries: total,
      byCategory: Object.fromEntries(
        byCategory.map((g: any) => [g.category, g._count.category])
      ),
      bySeverity: Object.fromEntries(
        bySeverity.map((g: any) => [g.severity, g._count.severity])
      ),
      chainVerified,
    };
  } catch (err) {
    console.error('[AuditLogViewer] Failed to fetch stats:', err);
    return { totalEntries: 0, byCategory: {}, bySeverity: {}, chainVerified: true };
  }
}

async function verifyChain(): Promise<{ valid: boolean; brokenAt?: string; totalEntries: number }> {
  try {
    const result = await verifyChainAction();
    return {
      valid: result.valid,
      brokenAt: result.brokenAt?.toString(),
      totalEntries: result.totalEntries,
    };
  } catch (err) {
    console.error('[AuditLogViewer] Failed to verify chain:', err);
    return { valid: false, totalEntries: 0 };
  }
}

// ─── Constants ────────────────────────────────────────────────────────────

const CATEGORIES = ['ALL', 'ACTIVITY', 'AUTH', 'DATA_CHANGE', 'ACCESS', 'CHAT', 'ADMIN', 'BILLING'];
const SEVERITIES = ['ALL', 'INFO', 'WARNING', 'CRITICAL'];

const CATEGORY_ICONS: Record<string, typeof Activity> = {
  ACTIVITY: Activity,
  AUTH: Lock,
  DATA_CHANGE: Edit3,
  ACCESS: Eye,
  CHAT: FileText,
  ADMIN: Shield,
  BILLING: Download,
};

const CATEGORY_COLORS: Record<string, string> = {
  ACTIVITY: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  AUTH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DATA_CHANGE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ACCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CHAT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
  BILLING: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const SEVERITY_COLORS: Record<string, string> = {
  INFO: 'text-blue-400',
  WARNING: 'text-amber-400',
  CRITICAL: 'text-red-400',
};

const ACTION_ICONS: Record<string, typeof Activity> = {
  CREATE: Activity,
  UPDATE: Edit3,
  DELETE: Trash2,
  ACCESS: Eye,
  LOGIN: Lock,
  LOGOUT: Lock,
  EXPORT: Download,
  PRINT: FileText,
  SHARE: Download,
};

// ─── Component ────────────────────────────────────────────────────────────

interface AuditLogViewerProps {
  compact?: boolean;
}

export default function AuditLogViewer({ compact }: AuditLogViewerProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [actorFilter, setActorFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Chain verification
  const [chainVerified, setChainVerified] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logResult, statsResult] = await Promise.all([
        fetchAuditLog({
          limit,
          offset: page * limit,
          actorId: actorFilter || undefined,
          resource: resourceFilter || undefined,
          category: category !== 'ALL' ? category : undefined,
          severity: severity !== 'ALL' ? severity : undefined,
        }),
        fetchAuditStats(),
      ]);
      setEntries(logResult.entries);
      setTotal(logResult.total);
      setStats(statsResult);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const result = await verifyChain();
      setChainVerified(result.valid);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, category, severity, actorFilter, resourceFilter]);

  const totalPages = Math.ceil(total / limit);

  if (compact) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Recent Audit Activity
          </h3>
          <button
            onClick={loadData}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-1">
          {entries.slice(0, 10).map((entry: any) => (
            <div key={entry.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-gray-800">
              <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_COLORS[entry.severity]?.replace('text-', 'bg-') ?? 'bg-gray-500'}`} />
              <span className="text-gray-400 min-w-[80px]">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              <span className="text-gray-300 truncate">{entry.actorName}</span>
              <span className="text-gray-500">{entry.action}</span>
              <span className="text-gray-400 truncate">{entry.resource}</span>
            </div>
          ))}
          {entries.length === 0 && !loading && (
            <p className="text-xs text-gray-500 text-center py-4">No audit entries</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-gray-100">Audit Log</h2>
            {stats && (
              <span className="text-xs text-gray-500">{stats.totalEntries.toLocaleString()} entries</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifyChain}
              disabled={verifying}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                chainVerified
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {verifying ? <RefreshCw className="w-3 h-3 animate-spin" /> : chainVerified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
              {verifying ? 'Verifying...' : chainVerified ? 'Chain Verified' : 'Chain Broken'}
            </button>
            <button
              onClick={loadData}
              className="p-1.5 rounded hover:bg-gray-800 text-gray-400"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="flex gap-3 mb-4 text-xs">
            {Object.entries(stats.byCategory).slice(0, 4).map(([cat, count]) => {
              const Icon = CATEGORY_ICONS[cat] ?? Activity;
              return (
                <div key={cat} className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/50">
                  <Icon className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400">{cat}</span>
                  <span className="text-gray-200 font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded text-xs">
            <Search className="w-3 h-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-gray-200 w-40"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2 py-1.5 bg-gray-800 rounded text-xs text-gray-300 outline-none"
          >
            {CATEGORIES.map((c: any) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="px-2 py-1.5 bg-gray-800 rounded text-xs text-gray-300 outline-none"
          >
            {SEVERITIES.map((s: any) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by actor..."
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-2 py-1.5 bg-gray-800 rounded text-xs text-gray-300 outline-none w-36"
          />
          <input
            type="text"
            placeholder="Filter by resource..."
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="px-2 py-1.5 bg-gray-800 rounded text-xs text-gray-300 outline-none w-36"
          />
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Shield className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No audit entries found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            <AnimatePresence>
              {entries.map((entry: any) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors text-left"
                  >
                    {/* Severity indicator */}
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_COLORS[entry.severity]?.replace('text-', 'bg-') ?? 'bg-gray-500'}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-200">{entry.actorName}</span>
                        <span className="text-xs text-gray-500">({entry.actorRole})</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[entry.category] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {entry.category}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="text-gray-300 font-medium">{entry.action}</span>
                        {' '}
                        <span>{entry.resource}</span>
                        {entry.resourceId && (
                          <span className="text-gray-500"> #{entry.resourceId.slice(0, 8)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        {entry.ipAddress && (
                          <span>{entry.ipAddress}</span>
                        )}
                        {entry.department && (
                          <span>{entry.department}</span>
                        )}
                      </div>
                    </div>

                    {/* Hash indicator */}
                    <div className="flex-shrink-0 text-right">
                      <Hash className="w-3 h-3 text-gray-700" />
                      {entry.recordChanges?.length || entry.chatActions?.length || entry.accessLogs?.length ? (
                        <span className="text-[10px] text-gray-500 ml-1">
                          {(entry.recordChanges?.length ?? 0) + (entry.chatActions?.length ?? 0) + (entry.accessLogs?.length ?? 0)} details
                        </span>
                      ) : null}
                      {expandedId === entry.id ? (
                        <ChevronUp className="w-3 h-3 text-gray-500 ml-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-gray-500 ml-1" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {expandedId === entry.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-900/50 border-t border-gray-800"
                    >
                      <div className="p-4 space-y-3">
                        {/* Hash chain info */}
                        <div className="text-[10px] text-gray-600 space-y-0.5 font-mono">
                          <div>Chain Position: {entry.chainPosition}</div>
                          {entry.prevHash && <div>Prev Hash: {entry.prevHash.slice(0, 32)}...</div>}
                          {entry.hash && <div>Hash: {entry.hash.slice(0, 32)}...</div>}
                        </div>

                        {/* Record changes */}
                        {entry.recordChanges?.map((change: any) => (
                          <div key={change.id} className="p-3 rounded bg-gray-800/50">
                            <div className="text-xs font-medium text-gray-300 mb-2">
                              Record Change: {change.changeType} {change.entityType}
                            </div>
                            {change.changedFields.length > 0 && (
                              <div className="text-[10px] text-gray-500">
                                Changed fields: {change.changedFields.join(', ')}
                              </div>
                            )}
                            {change.beforeState && (
                              <pre className="mt-1 text-[10px] text-gray-600 bg-gray-900 p-2 rounded overflow-x-auto">
                                {JSON.stringify(change.beforeState, null, 2)}
                              </pre>
                            )}
                            {change.afterState && (
                              <pre className="mt-1 text-[10px] text-emerald-600 bg-gray-900 p-2 rounded overflow-x-auto">
                                {JSON.stringify(change.afterState, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}

                        {/* Chat actions */}
                        {entry.chatActions?.map((action: any) => (
                          <div key={action.id} className="p-3 rounded bg-gray-800/50">
                            <div className="text-xs font-medium text-gray-300 mb-2">
                              Chat: {action.action}
                            </div>
                            {action.originalContent && (
                              <div className="text-[10px] text-gray-500 line-through">{action.originalContent}</div>
                            )}
                            {action.newContent && (
                              <div className="text-[10px] text-emerald-500">{action.newContent}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded text-xs bg-gray-800 text-gray-300 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded text-xs bg-gray-800 text-gray-300 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
