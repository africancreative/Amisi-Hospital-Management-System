'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Microscope, 
  FlaskConical, 
  Scan, 
  ClipboardCheck, 
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ClinicalWorkspace } from '@/components/clinical/ClinicalWorkspace';
import { api } from '@/trpc/react';
import { format } from 'date-fns';

/**
 * Diagnostics Command Center (Lab & Radiology)
 * 
 * Manages the lifecycle of diagnostic orders from clinician request
 * to lab processing and result validation.
 */
export default function DiagnosticsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    // 1. Fetch Diagnostic Orders
    const { data: orders, isLoading } = api.lab.getOrders.useQuery();

    const handleOrderSelect = (order: any) => {
        setSelectedOrder(order);
    };

    const stats = [
        { label: 'Pending Lab', value: '14', icon: FlaskConical, color: 'text-amber-500' },
        { label: 'Imaging Queue', value: '8', icon: Scan, color: 'text-blue-500' },
        { label: 'Result Verification', value: '26', icon: ClipboardCheck, color: 'text-emerald-500' },
        { label: 'Stat Orders', value: '3', icon: Clock, color: 'text-red-500' },
    ];

    return (
        <ClinicalWorkspace 
          title="Diagnostics Command Center" 
          department="DIAGNOSTICS"
          patient={selectedOrder ? {
              id: selectedOrder.patientId,
              name: `${selectedOrder.patient.firstName} ${selectedOrder.patient.lastName}`,
              mrn: selectedOrder.patient.mrn,
              status: 'DIAGNOSTICS IN PROGRESS'
          } : undefined}
        >
            <div className="space-y-8">
                {/* Global Diagnostics Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-gray-900/40 border border-gray-800 p-4 rounded-2xl flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl bg-gray-950/80 border border-white/5 ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                                <span className="text-xl font-black text-white">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Diagnostics Master Queue */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
                        <div className="flex items-center gap-3">
                            <Microscope className="h-5 w-5 text-blue-500" />
                            <h2 className="text-sm font-black text-white uppercase tracking-tight">Orders Master Queue</h2>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search Accession Number..." 
                                    className="bg-gray-950/50 border border-gray-800 rounded-lg pl-10 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                />
                             </div>
                             <button className="p-2 bg-gray-800 border border-gray-700 hover:border-gray-500 text-white rounded-lg transition-all">
                                <Filter className="h-4 w-4" />
                             </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-950/20 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Order Details</th>
                                    <th className="px-6 py-4">Ordered By</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {orders?.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        onClick={() => handleOrderSelect(order)}
                                        className={`group hover:bg-white/5 transition-all cursor-pointer ${
                                            selectedOrder?.id === order.id ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${
                                                    order.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                                                }`}></div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                                                    {order.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white uppercase">{order.patient.firstName} {order.patient.lastName}</span>
                                                <span className="text-[9px] text-gray-500 font-mono tracking-tighter">{order.patient.mrn}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                                                <div className="p-1 px-2 rounded bg-gray-950 border border-gray-800 text-[9px] font-black text-blue-500 uppercase">
                                                    {order.category}
                                                </div>
                                                {order.testName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-gray-400 italic">Dr. Malo (ER)</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-mono text-gray-500">{format(new Date(order.createdAt), 'HH:mm')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ArrowRight className="h-4 w-4 text-gray-700 ml-auto group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Diagnostics Processing Hub */}
                {selectedOrder && (
                    <div className="bg-gray-900/40 border border-blue-500/20 rounded-2xl overflow-hidden shadow-2xl lg:grid lg:grid-cols-3 animate-in slide-in-from-bottom-6 duration-700">
                        <div className="col-span-2 p-8 border-r border-gray-800 bg-gray-950/50">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <FlaskConical className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-white uppercase tracking-tight">Order Lifecycle Management</h2>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{selectedOrder.testName} Workflow</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Acc:</span>
                                    <span className="text-[10px] font-mono text-white px-2 py-1 bg-gray-800 rounded border border-gray-700">#ABC-123456</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-8">
                                {[
                                    { label: 'Specimen Collected', time: '14:24', status: 'COMPLETE' },
                                    { label: 'Lab Processing', time: '14:38', status: 'IN_PROGRESS' },
                                    { label: 'Validation', time: '--:--', status: 'PENDING' },
                                ].map((step) => (
                                    <div key={step.label} className="flex flex-col p-4 bg-gray-900 border border-gray-800 rounded-2xl relative overflow-hidden">
                                        {step.status === 'COMPLETE' && <CheckCircle2 className="absolute -top-1 -right-1 h-12 w-12 text-emerald-500/10" />}
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">{step.label}</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-black text-white font-mono">{step.time}</span>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                                step.status === 'COMPLETE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                                {step.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Preliminary Readings / Findings</label>
                                <textarea rows={4} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none resize-none" placeholder="Enter findings for validation..."></textarea>
                            </div>
                        </div>

                        {/* Financial Audit for Order */}
                        <div className="bg-gray-900/40 p-8 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-white font-mono uppercase tracking-widest leading-none">Order Financials</h4>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase truncate">Billed to: Cash Patient</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">{selectedOrder.testName}</span>
                                        <span className="text-white font-mono">$42.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Specimen Handling</span>
                                        <span className="text-white font-mono">$5.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs italic">
                                        <span className="text-gray-500">Processing Overlay</span>
                                        <span className="text-gray-500 font-mono">$0.00</span>
                                    </div>
                                </div>

                                <div className="h-[1px] bg-gray-800 my-6"></div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-white uppercase">Total Billed</span>
                                    <span className="text-2xl font-black text-blue-500 font-mono">$47.00</span>
                                </div>
                                
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase">Financial Clearance Verified</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95 shadow-blue-900/20">
                                    Validate & Release Findings
                                </button>
                                <button className="w-full py-3 bg-red-600/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all">
                                    Reject: Specimen Issue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClinicalWorkspace>
    );
}
