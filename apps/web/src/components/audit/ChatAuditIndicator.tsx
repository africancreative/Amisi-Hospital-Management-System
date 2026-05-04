'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Clock,
  Eye,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

interface ChatAuditEntry {
  id: string;
  messageId?: string;
  action: 'EDIT' | 'DELETE' | 'FORWARD' | 'SCREENSHOT' | 'EXPORT' | 'PIN' | 'UNPIN' | 'REACT';
  originalContent?: string;
  newContent?: string;
  actorId: string;
  actorName: string;
  timestamp: string;
}

// ─── Component ────────────────────────────────────────────────────────────

interface ChatAuditIndicatorProps {
  messageId: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  editCount?: number;
  lastEditedAt?: string;
  compact?: boolean;
}

export default function ChatAuditIndicator({
  messageId,
  isEdited,
  isDeleted,
  editCount,
  lastEditedAt,
  compact,
}: ChatAuditIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [auditTrail, setAuditTrail] = useState<ChatAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      // TODO: Implement server action to fetch chat audit trail
      setAuditTrail([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isEdited && !isDeleted && !editCount) {
    return null;
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] text-gray-500">
        {isEdited && <Edit3 className="w-2.5 h-2.5" />}
        {isEdited && (editCount ? `edited ${editCount}x` : '(edited)')}
        {isDeleted && <span className="text-red-400">(deleted)</span>}
        {lastEditedAt && (
          <span className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {new Date(lastEditedAt).toLocaleTimeString()}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      {isEdited && (
        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
          <Edit3 className="w-3 h-3" />
          edited {editCount ?? ''}{editCount ? ' times' : ''}
        </span>
      )}
      {isDeleted && (
        <span className="text-[10px] text-red-400 flex items-center gap-0.5">
          <Trash2 className="w-3 h-3" />
          deleted
        </span>
      )}

      {/* Audit trail dropdown */}
      {(isEdited || editCount) && (
        <button
          onClick={() => {
            setExpanded(!expanded);
            if (!expanded && auditTrail.length === 0) loadAuditTrail();
          }}
          className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-0.5"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          history
        </button>
      )}

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="absolute z-10 mt-1 p-2 rounded bg-gray-900 border border-gray-700 shadow-xl min-w-[200px]"
        >
          <div className="text-[10px] font-medium text-gray-400 mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Edit History
          </div>
          {loading ? (
            <p className="text-[10px] text-gray-600">Loading...</p>
          ) : auditTrail.length === 0 ? (
            <p className="text-[10px] text-gray-600">No audit records</p>
          ) : (
            <div className="space-y-2">
              {auditTrail.map((entry: any) => (
                <div key={entry.id} className="text-[10px]">
                  <div className="flex items-center gap-1 text-gray-500">
                    {entry.action === 'EDIT' && <Edit3 className="w-2.5 h-2.5 text-amber-400" />}
                    {entry.action === 'DELETE' && <Trash2 className="w-2.5 h-2.5 text-red-400" />}
                    {entry.action === 'FORWARD' && <Eye className="w-2.5 h-2.5 text-blue-400" />}
                    <span>{entry.actorName}</span>
                    <span>{entry.action}</span>
                    <span className="text-gray-600">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {entry.originalContent && (
                    <div className="text-gray-600 line-through mt-0.5 truncate">{entry.originalContent}</div>
                  )}
                  {entry.newContent && (
                    <div className="text-emerald-500 mt-0.5 truncate">{entry.newContent}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
