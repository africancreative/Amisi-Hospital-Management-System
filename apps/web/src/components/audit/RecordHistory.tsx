'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Clock,
  User,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

interface ChangeRecord {
  id: string;
  entityType: string;
  entityId: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  changedFields: string[];
  actorId: string;
  actorName: string;
  timestamp: string;
  auditLog: {
    id: string;
    action: string;
    category: string;
    hash?: string | null;
  };
}

// ─── Server Action ────────────────────────────────────────────────────────

async function fetchRecordHistory(entityType: string, entityId: string): Promise<ChangeRecord[]> {
  // TODO: Implement with actual server action
  return [];
}

// ─── Component ────────────────────────────────────────────────────────────

interface RecordHistoryProps {
  entityType: string;
  entityId: string;
  compact?: boolean;
}

export default function RecordHistory({ entityType, entityId, compact }: RecordHistoryProps) {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchRecordHistory(entityType, entityId)
      .then(setChanges)
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const ChangeIconMap = {
    CREATE: Plus,
    UPDATE: Edit3,
    DELETE: Trash2,
  } as const;

  const ChangeColorMap = {
    CREATE: 'text-emerald-400',
    UPDATE: 'text-amber-400',
    DELETE: 'text-red-400',
  } as const;

  if (compact) {
    return (
      <div className="p-3">
        <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-2">
          <History className="w-3.5 h-3.5" />
          Change History ({changes.length})
        </h4>
        <div className="space-y-1">
          {changes.slice(0, 5).map((change: any) => {
            const Icon = ChangeIconMap[change.changeType as keyof typeof ChangeIconMap];
            return (
              <div key={change.id} className="flex items-center gap-2 text-[10px] text-gray-500">
                <Icon className={`w-3 h-3 ${ChangeColorMap[change.changeType as keyof typeof ChangeColorMap]}`} />
                <span>{change.actorName}</span>
                <span>{change.changeType.toLowerCase()}</span>
                <span className="text-gray-600">{new Date(change.timestamp).toLocaleDateString()}</span>
              </div>
            );
          })}
          {changes.length === 0 && !loading && (
            <p className="text-[10px] text-gray-600">No changes recorded</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-200">
            Change History: {entityType}
          </h3>
          <span className="text-xs text-gray-500">#{entityId.slice(0, 8)}</span>
          <span className="text-xs text-gray-600 ml-auto">{changes.length} changes</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Clock className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        ) : changes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <History className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No changes recorded</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <AnimatePresence>
              {changes.map((change: any, index: any) => {
                const Icon = ChangeIconMap[change.changeType as keyof typeof ChangeIconMap];
                const Color = ChangeColorMap[change.changeType as keyof typeof ChangeColorMap];

                return (
                  <motion.div
                    key={change.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Timeline connector */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-800 ${Color}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        {index < changes.length - 1 && (
                          <div className="w-px h-full bg-gray-800 mt-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${Color}`}>{change.changeType}</span>
                          <span className="text-xs text-gray-400">by {change.actorName}</span>
                          <span className="text-[10px] text-gray-600">
                            {new Date(change.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {/* Changed fields */}
                        {change.changedFields.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {change.changedFields.map((field: any) => (
                              <span
                                key={field}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Expandable diff */}
                        {(change.beforeState || change.afterState) && (
                          <button
                            onClick={() => setExpandedId(expandedId === change.id ? null : change.id)}
                            className="mt-2 flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300"
                          >
                            {expandedId === change.id ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            {expandedId === change.id ? 'Hide' : 'Show'} details
                          </button>
                        )}

                        {/* Expanded diff */}
                        {expandedId === change.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-2 space-y-2"
                          >
                            {/* Before */}
                            {change.beforeState && (
                              <div className="p-2 rounded bg-red-500/5 border border-red-500/10">
                                <div className="text-[10px] text-red-400 font-medium mb-1">Before</div>
                                {Object.entries(change.beforeState).map(([key, value]) => {
                                  const wasChanged = change.changedFields.includes(key);
                                  return (
                                    <div key={key} className={`text-[10px] flex gap-2 ${wasChanged ? 'text-red-300' : 'text-gray-600'}`}>
                                      <span className="text-gray-500">{key}:</span>
                                      {wasChanged && <RotateCcw className="w-2.5 h-2.5 text-red-500 shrink-0" />}
                                      <span className="truncate">{formatValue(value)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* After */}
                            {change.afterState && (
                              <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/10">
                                <div className="text-[10px] text-emerald-400 font-medium mb-1">After</div>
                                {Object.entries(change.afterState).map(([key, value]) => {
                                  const wasChanged = change.changedFields.includes(key);
                                  const oldValue = change.beforeState?.[key];
                                  return (
                                    <div key={key} className={`text-[10px] flex gap-2 ${wasChanged ? 'text-emerald-300' : 'text-gray-600'}`}>
                                      <span className="text-gray-500">{key}:</span>
                                      {wasChanged && oldValue !== undefined && (
                                        <div className="flex items-center gap-0.5">
                                          <span className="text-red-500 line-through">{formatValue(oldValue)}</span>
                                          <ArrowRight className="w-2.5 h-2.5 text-gray-500" />
                                        </div>
                                      )}
                                      <span className="truncate">{formatValue(value)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
