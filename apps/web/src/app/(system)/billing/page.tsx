'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Eye,
  RefreshCw,
  Search,
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';
import { getSystemAccountingData } from '@/app/actions/system-actions';

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planName: string;
  planPrice: number;
  status: string;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  tenantSlug: string;
}

interface Payment {
  id: string;
  tenantName: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string;
  customerEmail: string;
  createdAt: Date;
  tenantSlug?: string;
}

export default function BillingDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [revenueData, setRevenueData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [accountingData, subsData, paymentsData, ordersData] = await Promise.all([
          getSystemAccountingData(),
          fetch('/api/system/subscriptions').then(r => r.json()).catch(() => []),
          fetch('/api/system/payments').then(r => r.json()).catch(() => []),
          fetch('/api/system/orders').then(r => r.json()).catch(() => [])
        ]);
        setRevenueData(accountingData);
        setSubscriptions(subsData.length > 0 ? subsData : []);
        setPayments(paymentsData.length > 0 ? paymentsData : []);
        setOrders(ordersData.length > 0 ? ordersData : []);
      } catch (error) {
        console.error('Failed to fetch billing data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSubs = subscriptions.filter(s => {
    const matchesSearch = s.tenantName.toLowerCase().includes(search.toLowerCase()) ||
                         s.planName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.tenantName.toLowerCase().includes(search.toLowerCase()) ||
                         p.reference.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.tenantName.toLowerCase().includes(search.toLowerCase()) ||
                         o.reference.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const expiringSoon = subscriptions.filter(s => {
    if (!s.endDate) return false;
    const daysUntil = Math.ceil((new Date(s.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0;
  });

  const failedPayments = payments.filter(p => p.status === 'FAILED');
  const pendingOrders = orders.filter(o => o.status === 'PENDING');

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch('/api/system/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      const updated = await fetch('/api/system/orders').then(r => r.json());
      setOrders(updated);
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 text-xl font-semibold">Billing Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage subscriptions and revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              fetch('/api/system/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tenantId: '1',
                  planId: '1',
                  amount: 2999,
                  method: 'PAYPAL',
                  tenantName: 'City General Hospital',
                  type: 'NEW_SUBSCRIPTION'
                })
              }).then(() => {
                fetch('/api/system/orders').then(r => r.json()).then(setOrders);
              });
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Create Order
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      {revenueData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={`$${Number(revenueData.totalRevenue || 0).toLocaleString()}`} 
            icon={<DollarSign className="w-5 h-5" />}
            trend="+12% vs last month"
            trendUp={true}
          />
          <StatCard 
            title="Active Subscriptions" 
            value={subscriptions.filter(s => s.status === 'ACTIVE').length.toString()} 
            icon={<CreditCard className="w-5 h-5" />}
            trend={`${subscriptions.length} total`}
            trendUp={true}
          />
          <StatCard 
            title="Pending Orders" 
            value={pendingOrders.length.toString()} 
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={pendingOrders.length > 0 ? 'Needs attention' : 'None pending'}
            trendUp={pendingOrders.length === 0}
            alert={pendingOrders.length > 0}
          />
          <StatCard 
            title="Failed Payments" 
            value={failedPayments.length.toString()} 
            icon={<XCircle className="w-5 h-5" />}
            trend={failedPayments.length > 0 ? 'Needs attention' : 'All clear'}
            trendUp={failedPayments.length === 0}
            alert={failedPayments.length > 0}
          />
          <StatCard 
            title="Expiring Soon" 
            value={expiringSoon.length.toString()} 
            icon={<Calendar className="w-5 h-5" />}
            trend="Within 30 days"
            trendUp={expiringSoon.length === 0}
            alert={expiringSoon.length > 0}
          />
        </div>
      )}

      {/* Alerts */}
      {(expiringSoon.length > 0 || failedPayments.length > 0 || pendingOrders.length > 0) && (
        <div className="space-y-3">
          {pendingOrders.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h3 className="text-yellow-400 text-sm font-medium">Pending Orders</h3>
              </div>
              <div className="space-y-2">
                {pendingOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between bg-yellow-900/10 rounded-lg p-3">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">{order.tenantName}</p>
                      <p className="text-yellow-400/60 text-xs">{order.type?.replace(/_/g, ' ') || 'N/A'} • ${Number(order.amount).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 text-xs rounded-lg hover:bg-yellow-600/30 transition-colors"
                      >
                        Complete
                      </button>
                      <Link
                        href={`/tenants/${order.tenantSlug}`}
                        className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 text-xs rounded-lg hover:bg-yellow-600/30 transition-colors"
                      >
                        View Tenant
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiringSoon.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h3 className="text-yellow-400 text-sm font-medium">Expiring Subscriptions</h3>
              </div>
              <div className="space-y-2">
                {expiringSoon.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between bg-yellow-900/10 rounded-lg p-3">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">{sub.tenantName}</p>
                      <p className="text-yellow-400/60 text-xs">{sub.planName} • Expires {new Date(sub.endDate!).toLocaleDateString()}</p>
                    </div>
                    <Link
                      href={`/tenants/${sub.tenantSlug}`}
                      className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 text-xs rounded-lg hover:bg-yellow-600/30 transition-colors"
                    >
                      View Tenant
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {failedPayments.length > 0 && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-red-400 text-sm font-medium">Failed Payments</h3>
              </div>
              <div className="space-y-2">
                {failedPayments.slice(0, 5).map(payment => (
                  <div key={payment.id} className="flex items-center justify-between bg-red-900/10 rounded-lg p-3">
                    <div>
                      <p className="text-red-100 text-sm font-medium">{payment.tenantName}</p>
                      <p className="text-red-400/60 text-xs">{payment.method} • ${Number(payment.amount).toFixed(2)} • {payment.reference}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-red-600/20 text-red-400 text-xs rounded-lg hover:bg-red-600/30 transition-colors">
                      Retry Payment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders Section - Pending Orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className={`text-gray-300 text-sm font-medium flex items-center gap-2 ${pendingOrders.length > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
            <AlertTriangle className="w-4 h-4" />
            Pending Orders
            {pendingOrders.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Tenant</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-right text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/tenants/${order.tenantSlug}`} className="text-gray-300 text-sm hover:text-blue-400 transition-colors">
                      {order.tenantName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{order.type?.replace(/_/g, ' ') || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">${Number(order.amount).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                            className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-gray-800 rounded transition-colors"
                            title="Mark Complete"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'FAILED')}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                            title="Mark Failed"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/tenants/${order.tenantSlug}`}
                        className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors"
                        title="View Tenant"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No pending orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      {revenueData && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Revenue Trend
            </h3>
          </div>
          <div className="h-48 flex items-end gap-1">
            {(revenueData.chartData || []).map((item: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-emerald-600/80 hover:bg-emerald-500 rounded-t transition-all"
                  style={{ height: `${(Number(item.revenue) / 130000) * 100}%` }}
                />
                <span className="text-gray-600 text-xs">{item.month?.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PAST_DUE">Past Due</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Tenant</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Plan</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Price</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Auto-Renew</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Start Date</th>
                <th className="text-right text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map(sub => (
                <tr key={sub.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/tenants/${sub.tenantSlug}`} className="text-gray-300 text-sm hover:text-blue-400 transition-colors">
                      {sub.tenantName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{sub.planName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">${sub.planPrice}/mo</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-4 py-3">
                    {sub.autoRenew ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-500" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{new Date(sub.startDate).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/tenants/${sub.tenantSlug}`}
                        className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-gray-300 text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            Payment History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Tenant</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Method</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Reference</th>
                <th className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">{payment.tenantName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-sm">${Number(payment.amount).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{payment.method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs font-mono">{payment.reference}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp, alert }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${alert ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-900 border-gray-800'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-500 text-xs">{title}</p>
        <div className={`p-2 rounded-lg ${alert ? 'bg-red-800/30 text-red-400' : 'bg-gray-800 text-gray-600'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${alert ? 'text-red-100' : 'text-gray-100'}`}>{value}</p>
      {trend && (
        <p className={`text-xs mt-2 flex items-center gap-1 ${trendUp ? 'text-emerald-400' : alert ? 'text-red-400' : 'text-gray-500'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    'ACTIVE': { bg: 'bg-emerald-900/30', text: 'text-emerald-400', icon: CheckCircle },
    'PAST_DUE': { bg: 'bg-red-900/30', text: 'text-red-400', icon: XCircle },
    'CANCELLED': { bg: 'bg-gray-800', text: 'text-gray-500', icon: XCircle },
  };
  const { bg, text, icon: Icon } = config[status] || config['ACTIVE'];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    'COMPLETED': { bg: 'bg-emerald-900/30', text: 'text-emerald-400', icon: CheckCircle },
    'FAILED': { bg: 'bg-red-900/30', text: 'text-red-400', icon: XCircle },
    'PENDING': { bg: 'bg-yellow-900/30', text: 'text-yellow-400', icon: AlertTriangle },
  };
  const { bg, text, icon: Icon } = config[status] || config['COMPLETED'];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    'COMPLETED': { bg: 'bg-emerald-900/30', text: 'text-emerald-400', icon: CheckCircle },
    'FAILED': { bg: 'bg-red-900/30', text: 'text-red-400', icon: XCircle },
    'PENDING': { bg: 'bg-yellow-900/30', text: 'text-yellow-400', icon: AlertTriangle },
  };
  const { bg, text, icon: Icon } = config[status] || config['PENDING'];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
