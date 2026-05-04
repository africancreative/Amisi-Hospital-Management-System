'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  XCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  PackageX,
  Zap,
} from 'lucide-react';
import { getActiveStockAlerts, getInventorySummary, getExpiringBatches, resolveStockAlert, InventorySummary } from '@/lib/inventory-flow-actions';
import { useStockUpdates, StockUpdate, StockAlertEvent } from '@/hooks/use-stock-updates';

interface RealtimeStockTrackerProps {
  compact?: boolean;
  itemId?: string;
  tenantId?: string;
}

export function RealtimeStockTracker({ compact, itemId, tenantId }: RealtimeStockTrackerProps) {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('alerts');
  const [liveUpdates, setLiveUpdates] = useState<StockUpdate[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<StockAlertEvent[]>([]);

  const handleStockUpdate = useCallback((update: StockUpdate) => {
    setLiveUpdates(prev => [update, ...prev].slice(0, 10));
    setSummary(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        lowStockCount: prev.lowStockItems.filter((i: any) => i.quantity > 0 && i.quantity <= i.minLevel).length + (update.newQty > 0 && update.newQty <= 10 ? 1 : 0),
        outOfStockCount: prev.outOfStockItems.filter((i: any) => i.quantity <= 0).length + (update.newQty <= 0 ? 1 : 0),
      };
    });
  }, []);

  const handleAlert = useCallback((alert: StockAlertEvent) => {
    setLiveAlerts(prev => [alert, ...prev].slice(0, 10));
    setAlerts(prev => [{ id: alert.itemId, type: alert.alertType, message: alert.message, createdAt: new Date(alert.timestamp), isResolved: false }, ...prev]);
  }, []);

  const { isConnected } = useStockUpdates({
    tenantId: tenantId || '',
    enabled: !!tenantId,
    onStockUpdate: handleStockUpdate,
    onAlert: handleAlert,
  });

  async function fetchData() {
    setLoading(true);
    const [summaryData, alertsData, expiringData] = await Promise.all([
      getInventorySummary(),
      getActiveStockAlerts(),
      getExpiringBatches(30),
    ]);
    setSummary(summaryData as any);
    setAlerts(alertsData);
    setExpiring(expiringData);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {summary.outOfStockCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
            <XCircle className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase">{summary.outOfStockCount}</span>
          </span>
        )}
        {summary.lowStockCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase">{summary.lowStockCount}</span>
          </span>
        )}
        {summary.activeAlertCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
            <AlertOctagon className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase">{summary.activeAlertCount}</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#07070a] text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-blue-500" />
          <h2 className="text-sm font-black uppercase tracking-widest">Stock Monitor</h2>
        </div>
      </div>

      {/* KPI Row */}
      <div className="px-6 py-4 border-b border-gray-800/30 shrink-0">
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Total Items" value={summary.totalItems} color="blue" />
          <StatCard label="Low Stock" value={summary.lowStockCount} color="amber" />
          <StatCard label="Out of Stock" value={summary.outOfStockCount} color="red" />
          <StatCard label="Active Alerts" value={summary.activeAlertCount} color="orange" />
        </div>
      </div>

      {/* Live Connection Indicator */}
      {tenantId && (
        <div className="px-6 py-2 border-b border-gray-800/30 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-[9px] font-black uppercase text-gray-500">{isConnected ? 'Live SSE Connected' : 'Connecting...'}</span>
          </div>
          {liveUpdates.length > 0 && (
            <span className="text-[9px] font-black text-blue-400">{liveUpdates.length} update{liveUpdates.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      {/* Live Stock Updates Feed */}
      {liveUpdates.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-800/30 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3 w-3 text-blue-400" />
            <span className="text-[9px] font-black uppercase text-gray-500">Recent Dispensing</span>
          </div>
          <div className="space-y-1">
            {liveUpdates.slice(0, 3).map((update: any, idx: any) => (
              <motion.div
                key={`${update.itemId}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-blue-400" />
                  <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{update.itemName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-gray-500">{update.previousQty}</span>
                  <span className="text-[9px] text-red-400">→</span>
                  <span className={`text-[9px] font-mono font-black ${update.newQty <= 0 ? 'text-red-500' : update.newQty <= 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {update.newQty}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Live Alerts Feed */}
      {liveAlerts.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-800/30 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span className="text-[9px] font-black uppercase text-gray-500">Live Alerts</span>
          </div>
          <div className="space-y-1">
            {liveAlerts.slice(0, 2).map((alert: any, idx: any) => (
              <motion.div
                key={`${alert.itemId}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  alert.alertType === 'OUT_OF_STOCK'
                    ? 'bg-red-500/5 border border-red-500/10'
                    : 'bg-amber-500/5 border border-amber-500/10'
                }`}
              >
                <AlertOctagon className={`h-3 w-3 ${alert.alertType === 'OUT_OF_STOCK' ? 'text-red-400' : 'text-amber-400'}`} />
                <span className="text-[10px] font-bold text-white truncate flex-1">{alert.message}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Alerts */}
        <ExpandableSection
          title="Stock Alerts"
          count={alerts.length}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          isExpanded={expandedSection === 'alerts'}
          onToggle={() => setExpandedSection(expandedSection === 'alerts' ? null : 'alerts')}
        >
          {alerts.length === 0 ? (
            <p className="text-xs text-gray-600 py-2">No active alerts</p>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 10).map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/30">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-3 w-3 ${alert.alertType === 'OUT_OF_STOCK' ? 'text-red-400' : 'text-amber-400'}`} />
                    <span className="text-[10px] text-gray-400 truncate">{alert.message}</span>
                  </div>
                  <button
                    onClick={async () => {
                      await resolveStockAlert(alert.id);
                      fetchData();
                    }}
                    className="px-2 py-0.5 rounded text-[9px] font-bold text-gray-600 hover:text-white transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </ExpandableSection>

        {/* Out of Stock */}
        <ExpandableSection
          title="Out of Stock"
          count={summary.outOfStockItems.length}
          icon={PackageX}
          iconColor="text-red-400"
          isExpanded={expandedSection === 'outofstock'}
          onToggle={() => setExpandedSection(expandedSection === 'outofstock' ? null : 'outofstock')}
        >
          {summary.outOfStockItems.length === 0 ? (
            <p className="text-xs text-gray-600 py-2">All items in stock</p>
          ) : (
            <div className="space-y-2">
              {summary.outOfStockItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="text-[10px] text-red-300">{item.name}</span>
                  <span className="text-[9px] text-red-500 font-bold">Reorder {item.reorderQty} {item.unit}</span>
                </div>
              ))}
            </div>
          )}
        </ExpandableSection>

        {/* Low Stock */}
        <ExpandableSection
          title="Low Stock"
          count={summary.lowStockItems.length}
          icon={TrendingDown}
          iconColor="text-amber-400"
          isExpanded={expandedSection === 'lowstock'}
          onToggle={() => setExpandedSection(expandedSection === 'lowstock' ? null : 'lowstock')}
        >
          {summary.lowStockItems.length === 0 ? (
            <p className="text-xs text-gray-600 py-2">Stock levels healthy</p>
          ) : (
            <div className="space-y-2">
              {summary.lowStockItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <span className="text-[10px] text-amber-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-amber-500 font-bold">{item.quantity} / {item.minLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ExpandableSection>

        {/* Expiring Soon */}
        <ExpandableSection
          title="Expiring Soon (30 days)"
          count={expiring.length}
          icon={Clock}
          iconColor="text-purple-400"
          isExpanded={expandedSection === 'expiring'}
          onToggle={() => setExpandedSection(expandedSection === 'expiring' ? null : 'expiring')}
        >
          {expiring.length === 0 ? (
            <p className="text-xs text-gray-600 py-2">No batches expiring soon</p>
          ) : (
            <div className="space-y-2">
              {expiring.map((batch: any) => (
                <div key={batch.id} className="flex items-center justify-between p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                  <div>
                    <span className="text-[10px] text-purple-300">{batch.inventoryItem.name}</span>
                    <span className="text-[9px] text-gray-600 ml-2">#{batch.batchNumber}</span>
                  </div>
                  <span className="text-[9px] text-purple-500 font-bold">
                    {new Date(batch.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ExpandableSection>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    orange: 'text-orange-400',
  };

  return (
    <div className="text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">{label}</p>
      <p className={`text-lg font-black ${colors[color] ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

function ExpandableSection({
  title,
  count,
  icon: Icon,
  iconColor,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  iconColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-800/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-800/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</span>
          <span className="text-[9px] text-gray-600">({count})</span>
        </div>
        {isExpanded ? <ChevronUp className="h-3 w-3 text-gray-600" /> : <ChevronDown className="h-3 w-3 text-gray-600" />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
