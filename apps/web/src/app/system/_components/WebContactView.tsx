'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    MessageSquare,
    Search,
    Filter,
    Reply,
    Archive,
    Star,
    RefreshCw,
    Building2,
    CheckCircle2,
    Eye,
    X,
    ExternalLink,
    Zap,
    Mail,
    Phone,
    PlusCircle
} from 'lucide-react';
import { getContactMessages, updateContactMessageStatus, provisionTenantFromLead, submitContactForm } from '@/app/actions/ui-actions';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    hospitalName?: string;
    subject: string;
    message: string;
    status: string;
    date: string;
    rawDate: string;
    starred: boolean;
    convertedTenantId?: string;
    facilityType?: string;
    tags: string[];
    source?: string;
}

export function WebContactView() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
    const [provisioningId, setProvisioningId] = useState<string | null>(null);
    const [provisionNotice, setProvisionNotice] = useState<{ slug: string; name: string } | null>(null);

    const fetchMessages = useCallback(async (showIndicator = false) => {
        if (showIndicator) setRefreshing(true);
        try {
            const data = await getContactMessages();
            setMessages(data);
        } catch (err) {
            console.error('Failed to fetch contact messages:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load & 4-second live polling loop for real-time updates
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(() => {
            fetchMessages();
        }, 4000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const handleToggleStar = async (e: React.MouseEvent, msgId: string, currentStarred: boolean) => {
        e.stopPropagation();
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, starred: !currentStarred } : m));
        try {
            await updateContactMessageStatus(msgId, { starred: !currentStarred });
        } catch (err) {
            console.error('Failed to toggle star:', err);
        }
    };

    const handleUpdateStatus = async (msgId: string, newStatus: string) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: newStatus } : m));
        if (selectedMsg && selectedMsg.id === msgId) {
            setSelectedMsg(prev => prev ? { ...prev, status: newStatus } : null);
        }
        try {
            await updateContactMessageStatus(msgId, { status: newStatus });
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleProvisionTenant = async (msg: ContactMessage) => {
        setProvisioningId(msg.id);
        try {
            const res = await provisionTenantFromLead(msg.id);
            if (res.success) {
                setProvisionNotice({ slug: res.tenantSlug, name: res.tenantName });
                handleUpdateStatus(msg.id, 'Provisioned');
                await fetchMessages(true);
            }
        } catch (err: any) {
            alert(`Provisioning failed: ${err.message || err}`);
        } finally {
            setProvisioningId(null);
        }
    };

    const handleSimulateIncoming = async () => {
        setRefreshing(true);
        const sampleNames = ['Dr. Patricia Adams', 'Marcus Vance', 'Dr. Sarah Jenkins', 'Elena Rostova'];
        const sampleHospitals = ['St. Jude Memorial Hospital', 'Apex Care Center', 'Metro Heart Institute', 'KiliMed Specialist Clinic'];
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const randomHosp = sampleHospitals[Math.floor(Math.random() * sampleHospitals.length)];
        
        try {
            await submitContactForm({
                name: randomName,
                email: `${randomName.toLowerCase().replace(/[^a-z]/g, '')}@${randomHosp.toLowerCase().replace(/[^a-z]/g, '')}.org`,
                phone: '+254 7' + Math.floor(10000000 + Math.random() * 90000000),
                organization: randomHosp,
                subject: `Enterprise Onboarding & EHR Migration Inquiry`,
                message: `Hello, we operate a 150-bed facility and are interested in immediate deployment of AmisiMedOS with OPD, Pharmacy, and Billing modules.`,
                facilityType: 'HOSPITAL'
            });
            await fetchMessages(true);
        } catch (err) {
            console.error('Failed to simulate incoming message:', err);
        }
    };

    // Filter logic
    const filteredMessages = messages.filter(m => {
        const matchesSearch = 
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.hospitalName && m.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (statusFilter === 'UNREAD') return m.status === 'Unread';
        if (statusFilter === 'READ') return m.status === 'Read';
        if (statusFilter === 'REPLIED') return m.status === 'Replied';
        if (statusFilter === 'STARRED') return m.starred;
        if (statusFilter === 'PROVISIONED') return m.status === 'Provisioned';
        return true;
    });

    const unreadCount = messages.filter(m => m.status === 'Unread').length;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-gray-800 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                            <MessageSquare className="w-8 h-8 text-orange-500" />
                            Inbound Inquiries & Onboarding
                        </h1>
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 bg-orange-500 text-black text-xs font-black rounded-full animate-pulse">
                                {unreadCount} NEW
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 mt-2 text-sm">Real-time public contact submissions and enterprise onboarding requests.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleSimulateIncoming}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black text-xs font-black rounded-xl transition-all shadow-lg shadow-orange-500/20 uppercase tracking-wider"
                        title="Simulate a live public contact inquiry"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Simulate Inquiry
                    </button>

                    <button 
                        onClick={() => fetchMessages(true)}
                        disabled={refreshing}
                        className="p-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded-xl transition-all"
                        title="Refresh Messages"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {provisionNotice && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-400 text-sm animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-bold">Hospital Node Provisioned Successfully!</p>
                            <p className="text-xs text-emerald-500/80">Tenant <span className="font-mono text-white">{provisionNotice.name}</span> is live at slug <span className="font-mono text-white">{provisionNotice.slug}</span>.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a 
                            href={`/system/tenants`} 
                            className="px-3 py-1.5 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-1"
                        >
                            View Tenants <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button onClick={() => setProvisionNotice(null)} className="text-emerald-400 hover:text-white p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by sender, hospital, or subject..." 
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                    {['ALL', 'UNREAD', 'READ', 'REPLIED', 'STARRED', 'PROVISIONED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                statusFilter === tab 
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/80 sticky top-0 backdrop-blur-md">
                                <th className="p-4 w-12 text-center"></th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Sender / Organization</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Subject & Body Preview</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Received Date</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                                        Loading inbound payloads...
                                    </td>
                                </tr>
                            ) : filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        No messages match the active filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((msg) => {
                                    const isUnread = msg.status === 'Unread';
                                    const isProvisioned = msg.status === 'Provisioned';
                                    const isOnboarding = msg.tags?.includes('onboarding-request');

                                    return (
                                        <tr 
                                            key={msg.id} 
                                            onClick={() => {
                                                setSelectedMsg(msg);
                                                if (isUnread) handleUpdateStatus(msg.id, 'Read');
                                            }}
                                            className={`hover:bg-gray-800/60 transition-colors group cursor-pointer ${isUnread ? 'bg-orange-500/5 font-semibold' : ''}`}
                                        >
                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    onClick={(e) => handleToggleStar(e, msg.id, msg.starred)}
                                                    className="text-gray-600 hover:text-orange-500 transition-colors"
                                                >
                                                    <Star className={`w-4 h-4 ${msg.starred ? 'fill-orange-500 text-orange-500' : ''}`} />
                                                </button>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm ${isUnread ? 'font-bold text-white' : 'font-medium text-gray-200'}`}>
                                                        {msg.name}
                                                    </p>
                                                    {isOnboarding && (
                                                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase rounded">
                                                            Onboarding
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">{msg.email}</p>
                                                {msg.hospitalName && (
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Building2 className="w-3 h-3 text-gray-500" /> {msg.hospitalName}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="p-4 max-w-md">
                                                <p className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'text-gray-300'}`}>
                                                    {msg.subject}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {msg.message}
                                                </p>
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    msg.status === 'Unread' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                                                    msg.status === 'Provisioned' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                                                    msg.status === 'Replied' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                                                    'bg-gray-800 text-gray-400'
                                                }`}>
                                                    {msg.status}
                                                </span>
                                            </td>

                                            <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                                                {msg.date}
                                            </td>

                                            <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    {!isProvisioned && (
                                                        <button 
                                                            onClick={() => handleProvisionTenant(msg)}
                                                            disabled={provisioningId === msg.id}
                                                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                                                            title="Provision Tenant directly from this inquiry"
                                                        >
                                                            <Zap className="w-3.5 h-3.5 text-blue-400" />
                                                            {provisioningId === msg.id ? 'Provisioning...' : 'Provision Node'}
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={() => {
                                                            setSelectedMsg(msg);
                                                            if (isUnread) handleUpdateStatus(msg.id, 'Read');
                                                        }}
                                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                        title="Inspect Payload"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Detail Drawer Modal */}
            {selectedMsg && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Drawer Header */}
                        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-white">{selectedMsg.subject}</h2>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                        selectedMsg.status === 'Provisioned' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                        {selectedMsg.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Received {selectedMsg.date}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedMsg(null)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Sender Info Card */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-950 p-4 rounded-2xl border border-gray-800/80">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-500">Contact Sender</p>
                                <p className="text-sm font-bold text-gray-200 mt-0.5">{selectedMsg.name}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                    <Mail className="w-3 h-3 text-gray-500" /> {selectedMsg.email}
                                </p>
                                {selectedMsg.phone && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3 h-3 text-gray-500" /> {selectedMsg.phone}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-500">Hospital / Facility</p>
                                <p className="text-sm font-bold text-gray-200 mt-0.5 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-orange-500" /> {selectedMsg.hospitalName || 'Individual / Unspecified'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Facility Tier: {selectedMsg.facilityType || 'CLINIC'}</p>
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-gray-500">Inbound Payload / Message</p>
                            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800/80 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                {selectedMsg.message}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-800">
                            <div className="flex items-center gap-2">
                                {selectedMsg.status !== 'Provisioned' && (
                                    <button 
                                        onClick={() => handleProvisionTenant(selectedMsg)}
                                        disabled={provisioningId === selectedMsg.id}
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                    >
                                        <Zap className="w-4 h-4 text-amber-300" />
                                        {provisioningId === selectedMsg.id ? 'Provisioning Cluster...' : 'Provision Hospital Node'}
                                    </button>
                                )}

                                <a 
                                    href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                                    onClick={() => handleUpdateStatus(selectedMsg.id, 'Replied')}
                                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-gray-700"
                                >
                                    <Reply className="w-4 h-4" /> Reply Email
                                </a>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleUpdateStatus(selectedMsg.id, 'Archived')}
                                    className="px-3 py-2 bg-gray-950 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-semibold border border-gray-800"
                                >
                                    Archive
                                </button>
                                <button 
                                    onClick={() => setSelectedMsg(null)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
