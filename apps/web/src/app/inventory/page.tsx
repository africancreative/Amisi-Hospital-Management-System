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

export default async function InventoryPage() {
    const items = await getInventoryItems();

    const lowStockItems = items.filter(item => item.quantity <= item.minLevel);
    const totalValue = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Package className="h-10 w-10 text-emerald-500" />
                            Inventory Management
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">
                            Global Stock Control & Supply Chain Hub
                        </p>
                    </div>

                    <button className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 font-black text-white shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95 uppercase text-xs tracking-widest">
                        <Plus className="h-4 w-4" />
                        Add New Item
                    </button>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <StatCard
                        icon={Layers}
                        label="Total SKUs"
                        value={items.length.toString()}
                        trend="+3 this week"
                        trendUp={true}
                        color="blue"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Low Stock Alerts"
                        value={lowStockItems.length.toString()}
                        trend="Critical Items"
                        trendUp={false}
                        color="red"
                        alert={lowStockItems.length > 0}
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Inventory Value"
                        value={`$${totalValue.toLocaleString()}`}
                        trend="Live Valuation"
                        trendUp={true}
                        color="emerald"
                    />
                </div>

                {/* Inventory Table */}
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by SKU, Name or Category..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                <Filter className="h-4 w-4 text-gray-500" />
                            </button>
                            <button className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                <th className="px-8 py-5">SKU / Item Name</th>
                                <th className="px-4 py-5">Category</th>
                                <th className="px-4 py-5 text-center">Stock Level</th>
                                <th className="px-4 py-5 text-center">Min Level</th>
                                <th className="px-4 py-5">Price</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{item.name}</span>
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter mt-0.5">{item.sku || 'NO-SKU'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-xs font-bold text-gray-500">
                                        {item.category}
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-sm font-black ${item.quantity <= item.minLevel ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                {item.quantity} {item.unit}s
                                            </span>
                                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.quantity <= item.minLevel ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}
                                                    style={{ width: `${Math.min((item.quantity / (item.minLevel * 3)) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-center text-xs font-bold text-gray-400">
                                        {item.minLevel}
                                    </td>
                                    <td className="px-4 py-5 text-sm font-black text-gray-700 dark:text-gray-300">
                                        ${Number(item.price).toFixed(2)}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {items.length === 0 && (
                        <div className="p-20 text-center">
                            <Layers className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-gray-400">Inventory Empty</h3>
                            <p className="text-gray-500">Kickstart your supply chain by adding your first SKU.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, trend, trendUp, color, alert }: any) {
    const colors: any = {
        emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
        red: "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20",
        blue: "text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20"
    };

    return (
        <div className={`bg-white dark:bg-gray-950 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden ${alert ? 'border-red-500/50' : ''}`}>
            {alert && <div className="absolute top-0 right-0 p-4 border-l border-b border-red-500/20 rounded-bl-3xl bg-red-500/10 animate-pulse"><AlertTriangle className="h-4 w-4 text-red-500" /></div>}
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{label}</h3>
            <div className="flex items-end gap-3">
                <span className="text-3xl font-black">{value}</span>
                <span className={`text-[10px] font-black uppercase tracking-tighter mb-1.5 flex items-center gap-1 ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {trend}
                </span>
            </div>
        </div>
    );
}
