'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
    Repeat, 
    Calendar,
    PhoneCall,
    Mail,
    CheckCircle2,
    Clock,
    Plus,
    Loader2,
    X
} from 'lucide-react';
import { getCRMTasks } from '@/app/actions/ui-actions';

interface Workflow {
    id: string;
    name: string;
    description: string | null;
    trigger: string;
    action: string;
    enabled: boolean;
}

export function CRMAutomationsView() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [taskFilter, setTaskFilter] = useState<'today' | 'upcoming'>('today');

    const fetchWorkflows = useCallback(async () => {
        try {
            const res = await fetch('/api/crm/workflows');
            const data = await res.json();
            setWorkflows(Array.isArray(data) ? data : []);
        } catch {
            setWorkflows([]);
        }
    }, []);

    useEffect(() => {
        getCRMTasks().then(data => {
            setTasks(data);
            setLoading(false);
        });
        fetchWorkflows();
    }, [fetchWorkflows]);

    const toggleWorkflow = async (workflow: Workflow) => {
        const next = { ...workflow, enabled: !workflow.enabled };
        setWorkflows(workflows.map(w => w.id === workflow.id ? next : w));
        try {
            await fetch(`/api/crm/workflows/${workflow.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: next.enabled }),
            });
        } catch {
            setWorkflows(workflows.map(w => w.id === workflow.id ? workflow : w));
        }
    };

    const handleCreate = async (form: any) => {
        setSaving(true);
        try {
            const res = await fetch('/api/crm/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create workflow');
            setShowForm(false);
            fetchWorkflows();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const completeTask = async (task: any) => {
        await fetch(`/api/crm/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' }),
        });
        setTasks(prev => prev.filter(t => t.id !== task.id));
    };

    const visibleTasks = tasks.filter(t => {
        const due = new Date(t.dueDate);
        const today = new Date();
        const isToday = due.toDateString() === today.toDateString();
        return taskFilter === 'today' ? isToday : !isToday;
    });

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
                <button 
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2"
                >
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
                    
                    {workflows.length === 0 ? (
                        <div className="p-8 bg-gray-900 border border-gray-800 rounded-2xl text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                            No workflows yet. Create one to get started.
                        </div>
                    ) : workflows.map(workflow => (
                        <div key={workflow.id} className={`p-6 rounded-2xl border transition-all ${workflow.enabled ? 'bg-gray-900 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-gray-900/50 border-gray-800 opacity-70'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white">{workflow.name}</h3>
                                <button 
                                    onClick={() => toggleWorkflow(workflow)}
                                    className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${workflow.enabled ? 'bg-indigo-600' : 'bg-gray-700'}`}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-all ${workflow.enabled ? 'ml-5' : 'ml-0'}`} />
                                </button>
                            </div>
                            {workflow.description && (
                                <p className="text-xs text-gray-500 mb-3">{workflow.description}</p>
                            )}
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
                            <button 
                                onClick={() => setTaskFilter('today')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${taskFilter === 'today' ? 'bg-gray-800 text-white' : 'bg-transparent text-gray-500 hover:text-white'}`}
                            >
                                Today
                            </button>
                            <button 
                                onClick={() => setTaskFilter('upcoming')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${taskFilter === 'upcoming' ? 'bg-gray-800 text-white' : 'bg-transparent text-gray-500 hover:text-white'}`}
                            >
                                Upcoming
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Loading Tasks...</span>
                            </div>
                        ) : visibleTasks.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                No pending tasks. Inbox zero!
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {visibleTasks.map(task => (
                                    <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors group">
                                        <button 
                                            onClick={() => completeTask(task)}
                                            className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center group-hover:border-emerald-500 transition-colors"
                                            title="Mark complete"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-transparent group-hover:text-emerald-500/80 transition-colors" />
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

            {showForm && (
                <WorkflowForm onCancel={() => setShowForm(false)} onSave={handleCreate} saving={saving} />
            )}
        </div>
    );
}

function WorkflowForm({ onCancel, onSave, saving }: { onCancel: () => void; onSave: (form: any) => void; saving: boolean }) {
    const [form, setForm] = useState({ name: '', trigger: '', action: '', description: '', enabled: true });

    const set = (key: string) => (e: any) => setForm({ ...form, [key]: e.target.value });

    const submit = () => {
        if (!form.name || !form.trigger || !form.action) {
            alert('Name, trigger, and action are required.');
            return;
        }
        onSave({ ...form, enabled: form.enabled });
    };

    const inputCls = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50";
    const labelCls = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white uppercase italic">Create Workflow</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-5">
                    <div>
                        <label className={labelCls}>Workflow Name *</label>
                        <input className={inputCls} value={form.name} onChange={set('name')} placeholder="New Lead Onboarding" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Trigger *</label>
                            <input className={inputCls} value={form.trigger} onChange={set('trigger')} placeholder="Lead Created" />
                        </div>
                        <div>
                            <label className={labelCls}>Action *</label>
                            <input className={inputCls} value={form.action} onChange={set('action')} placeholder="Send Intro Email" />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Description</label>
                        <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={set('description')} placeholder="What does this automation do?" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="w-4 h-4 accent-indigo-600" />
                        <span className="text-sm font-bold text-gray-300">Enable immediately</span>
                    </label>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-all">
                        Cancel
                    </button>
                    <button onClick={submit} disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Workflow
                    </button>
                </div>
            </div>
        </div>
    );
}
