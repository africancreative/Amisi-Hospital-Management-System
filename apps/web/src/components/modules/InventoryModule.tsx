import React from 'react';
import {
    Package,
    Plus,
    Search,
    Filter,
    AlertTriangle,
    ArrowUpRight,
    MoreHorizontal,
    TrendingUp,
    TrendingDown,
    Layers
} from 'lucide-react';
import { getInventoryItems } from '@/app/actions/pharmacy-actions';

export default async function InventoryModule() {
    const items = await getInventoryItems();
    const lowStockItems = items.filter((item: any) => item.quantity <= item.minLevel);
    const totalValue = items.reduce((acc: any, item: any) => acc + (Number(item.price) * item.quantity), 0);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3"><Package className="h-10 w-10 text-emerald-500" /> Inventory Management</h1>
                        <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">Global Stock Control</p>
                    </div>
                    <button className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 font-black text-white shadow-2xl text-xs tracking-widest"><Plus className="h-4 w-4" /> Add New Item</button>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <StatCard icon={Layers} label="Total SKUs" value={items.length.toString()} trend="+3 this week" trendUp={true} color="blue" />
                    <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={lowStockItems.length.toString()} trend="Critical Items" trendUp={false} color="red" alert={lowStockItems.length > 0} />
                    <StatCard icon={TrendingUp} label="Inventory Value" value={`$${totalValue.toLocaleString()}`} trend="Live Valuation" trendUp={true} color="emerald" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, trend, trendUp, color, alert }: any) {
    const colors: any = { emerald: "text-emerald-500 bg-emerald-50", red: "text-red-500 bg-red-50", blue: "text-blue-500 bg-blue-50" };
    return (
        <div className={`bg-white p-8 rounded-3xl border ${alert ? 'border-red-500/50' : ''}`}>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}><Icon className="h-6 w-6" /></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{label}</h3>
            <div className="flex items-end gap-3"><span className="text-3xl font-black">{value}</span></div>
        </div>
    );
}
