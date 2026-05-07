'use client';

import React, { useEffect, useState } from 'react';
import { 
    Repeat, 
    Calendar,
    PhoneCall,
    Mail,
    CheckCircle2,
    Clock,
    Plus,
    Loader2
} from 'lucide-react';
import { getCRMTasks } from '@/app/actions/ui-actions';

export function CRMAutomationsView() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCRMTasks().then(data => {
            setTasks(data);
            setLoading(false);
        });
    }, []);

    const getTaskIcon = (type: string) => {
        switch (type) {
            case 'CALL': return <PhoneCall className="w-4 h-4 text-emerald-500" />;
            case 'EMAIL': return <Mail className="w-4 h-4 text-blue-500" />;
            default: return <Calendar className="w-4 h-4 text-purple-500" />;
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between pb-8 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Repeat className="w-8 h-8 text-indigo-500" />
                        Automations & Tasks
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Manage agent tasks and automated communication workflows.</p>
                </div>
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Workflow
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Workflows Panel */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Repeat className="w-5 h-5 text-gray-500" />
                        Active Workflows
                    </h2>
                    
                    {[
                        { title: 'New Lead Onboarding', trigger: 'Lead Created', action: 'Send Intro Email', active: true },
                        { title: 'Post-Demo Follow-up', trigger: 'Task (Demo) Completed', action: 'Send Proposal', active: true },
                        { title: 'Stale Lead Nurture', trigger: 'No Contact > 14 Days', action: 'Create Call Task', active: false },
                    ].map((workflow, i) => (
                        <div key={i} className={`p-6 rounded-2xl border transition-all ${workflow.active ? 'bg-gray-900 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-gray-900/50 border-gray-800 opacity-70'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white">{workflow.title}</h3>
                                <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${workflow.active ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-all ${workflow.active ? 'ml-5' : 'ml-0'}`} />
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span className="font-bold uppercase text-[10px] tracking-widest w-16">Trigger</span>
                                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">{workflow.trigger}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span className="font-bold uppercase text-[10px] tracking-widest w-16">Action</span>
                                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">{workflow.action}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upcoming Tasks Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            Agent Task Queue
                        </h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-gray-800 text-white rounded text-xs font-bold">Today</button>
                            <button className="px-3 py-1 bg-transparent text-gray-500 hover:text-white rounded text-xs font-bold transition-colors">Upcoming</button>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Loading Tasks...</span>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                No pending tasks. Inbox zero!
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {tasks.map(task => (
                                    <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors group">
                                        <button className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                                            <CheckCircle2 className="w-4 h-4 text-transparent group-hover:text-indigo-500/50" />
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                                            {getTaskIcon(task.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                                                {task.type} - {task.lead?.hospitalName || 'Unknown Lead'}
                                            </p>
                                            <p className="text-sm text-gray-400 truncate">{task.notes || 'No description provided'}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-medium text-amber-500">
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{task.assignedTo?.name || 'Unassigned'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
