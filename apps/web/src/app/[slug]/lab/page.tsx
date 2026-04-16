import {
    Microscope,
    Beaker,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    FlaskConical,
    ChevronRight,
    Search
} from 'lucide-react';
import Link from 'next/link';
import { getPendingLabOrders, updateLabOrderStatus } from '@/app/actions/lab-actions';

export default async function LabDashboardPage(
    props: {
        params: Promise<{ slug: string }>;
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }
) {
    const { slug } = await props.params;
    const orders = await getPendingLabOrders();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Microscope className="h-10 w-10 text-blue-500" />
                            Laboratory Worklist
                        </h1>
                        <p className="text-gray-500 font-medium mt-2">
                            Manage pending diagnostic tests and record results with precision.
                        </p>
                    </div>

                    <div className="flex bg-white dark:bg-gray-805 rounded-2xl border border-gray-200 dark:border-gray-800 p-1 shadow-sm">
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Active Orders</button>
                        <button className="px-6 py-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-black uppercase tracking-widest">Completed</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Worklist */}
                    <div className="lg:col-span-3 space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm hover:border-blue-500/30 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <FlaskConical className="h-8 w-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-black">{order.testPanelId}</h3>
                                                <PriorityPill priority={(order as any).urgency} />
                                            </div>
                                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <User className="h-3 w-3" />
                                                Patient: {order.patient ? `${order.patient.lastName}, ${order.patient.firstName}` : 'Unknown Patient'} • Order ID: {order.id.slice(0, 8)}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                                                <span className="flex items-center gap-1.5" suppressHydrationWarning><Clock className="h-3.5 w-3.5" /> Ordered {new Date(order.createdAt).toLocaleTimeString()}</span>
                                                <span className="flex items-center gap-1.5"><Beaker className="h-3.5 w-3.5" /> Dr. {order.orderedById || 'System'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <form action={async () => {
                                            'use server';
                                            await updateLabOrderStatus(order.id, 'collected');
                                        }}>
                                            <button className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                                                Mark Collected
                                            </button>
                                        </form>
                                        <Link
                                            href={`/${slug}/lab/${order.id}`}
                                            className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                        >
                                            Enter Results
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {orders.length === 0 && (
                            <div className="bg-white dark:bg-gray-950 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-20 text-center">
                                <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-gray-400">No Pending Lab Orders</h3>
                                <p className="text-gray-500">Diagnostic worklist is currently clear.</p>
                            </div>
                        )}
                    </div>

                    {/* Stats & Tools Sidebar */}
                    <div className="space-y-8">
                        <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Equipment Status</h4>
                            <div className="space-y-4">
                                <EquipmentStatus name="Sysmex XN-1000" status="online" />
                                <EquipmentStatus name="Cobas c 501" status="online" />
                                <EquipmentStatus name="Vitros 5600" status="error" />
                            </div>
                        </section>

                        <section className="bg-blue-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-600/30 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Microscope className="h-32 w-32" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-widest mb-4 border-b border-white/20 pb-4">Lab Integrity</h3>
                            <p className="text-sm opacity-90 leading-relaxed mb-6">
                                Synchronizing all diagnostic results with the Neon Core. All clinical data is encrypted and tenant-isolated.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-black">
                                <CheckCircle2 className="h-4 w-4" />
                                SYNC SECURE
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PriorityPill({ priority }: { priority: string }) {
    const isStat = priority === 'stat';
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isStat ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
            {priority}
        </span>
    );
}

function EquipmentStatus({ name, status }: { name: string, status: 'online' | 'offline' | 'error' }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{name}</span>
            <div className={`h-2 w-2 rounded-full ${status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                status === 'error' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                }`} />
        </div>
    );
}
