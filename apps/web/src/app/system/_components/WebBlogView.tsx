'use client';

import React from 'react';
import { 
    FileText, 
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    Eye
} from 'lucide-react';

export function WebBlogView() {
    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
            <div className="flex items-center justify-between pb-8 border-b border-gray-800 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <FileText className="w-8 h-8 text-pink-500" />
                        Blog & News
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Manage articles, press releases, and platform updates.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            placeholder="Search articles..." 
                            className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-pink-500/50 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-pink-600/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Article
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50">
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Title</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Author</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Category</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {[
                                { title: 'Introducing AmisiMedOS v4.0', author: 'System Admin', category: 'Product Update', status: 'Published', date: 'Oct 12, 2026' },
                                { title: 'Why Cloud Security Matters in Healthcare', author: 'Dr. James Smith', category: 'Security', status: 'Draft', date: 'Oct 10, 2026' },
                                { title: 'How AI is Transforming Diagnostics', author: 'Sarah Jenkins', category: 'Industry', status: 'Published', date: 'Oct 05, 2026' },
                                { title: 'New Pricing Plans for 2027', author: 'Finance Team', category: 'Company News', status: 'Scheduled', date: 'Nov 01, 2026' },
                            ].map((article, i) => (
                                <tr key={i} className="hover:bg-gray-800/50 transition-colors group cursor-pointer">
                                    <td className="p-4">
                                        <p className="font-bold text-white group-hover:text-pink-400 transition-colors">{article.title}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-gray-300">{article.author}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium">
                                            {article.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                            article.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            article.status === 'Draft' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {article.date}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
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
