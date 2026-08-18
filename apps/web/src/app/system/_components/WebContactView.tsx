'use client';

import React from 'react';
import { 
    MessageSquare,
    Search,
    Filter,
    Reply,
    Archive,
    Star,
    MoreVertical
} from 'lucide-react';

export function WebContactView() {
    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
            <div className="flex items-center justify-between pb-8 border-b border-gray-800 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-orange-500" />
                        Inbound Messages
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Review and respond to contact form submissions from the public website.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            placeholder="Search messages..." 
                            className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50">
                                <th className="p-4 w-12 text-center"></th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Sender</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Subject & Message</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {[
                                { name: 'Dr. Michael Chen', email: 'm.chen@valleyhospital.com', subject: 'Enterprise Pricing Inquiry', message: 'Hello, we are a 200-bed hospital looking to migrate our current EHR. Can we schedule a demo?', status: 'Unread', date: '10 mins ago', starred: true },
                                { name: 'Sarah Williams', email: 'sarah.w@cliniccare.org', subject: 'Support: Integration Question', message: 'Does AmisiMedOS support HL7 integrations out of the box?', status: 'Read', date: '2 hours ago', starred: false },
                                { name: 'James Peterson', email: 'j.peterson@investments.com', subject: 'Partnership Opportunity', message: 'We are looking to partner with healthcare SaaS platforms in East Africa...', status: 'Replied', date: 'Yesterday', starred: false },
                                { name: 'Elena Rodriguez', email: 'erodriguez@cityhealth.gov', subject: 'Compliance Request', message: 'Please provide documentation on your HIPAA and GDPR compliance measures.', status: 'Read', date: 'Oct 24', starred: true },
                            ].map((msg, i) => (
                                <tr key={i} className={`hover:bg-gray-800/50 transition-colors group cursor-pointer ${msg.status === 'Unread' ? 'bg-gray-800/20' : ''}`}>
                                    <td className="p-4 text-center">
                                        <button className="text-gray-600 hover:text-orange-500 transition-colors">
                                            <Star className={`w-4 h-4 ${msg.starred ? 'fill-orange-500 text-orange-500' : ''}`} />
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <p className={`text-sm ${msg.status === 'Unread' ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>{msg.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{msg.email}</p>
                                    </td>
                                    <td className="p-4 max-w-md">
                                        <p className={`text-sm truncate ${msg.status === 'Unread' ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>{msg.subject}</p>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{msg.message}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            msg.status === 'Unread' ? 'bg-orange-500/10 text-orange-500' :
                                            msg.status === 'Replied' ? 'bg-emerald-500/10 text-emerald-500' :
                                            'bg-gray-800 text-gray-400'
                                        }`}>
                                            {msg.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                                        {msg.date}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Reply">
                                                <Reply className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Archive">
                                                <Archive className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
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
