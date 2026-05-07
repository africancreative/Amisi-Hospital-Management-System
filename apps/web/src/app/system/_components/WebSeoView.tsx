'use client';

import React from 'react';
import { 
    Search,
    Save,
    Globe,
    BarChart2,
    Share2
} from 'lucide-react';

export function WebSeoView() {
    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between pb-8 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Search className="w-8 h-8 text-emerald-500" />
                        SEO & Analytics
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Configure search engine visibility and external tracking codes.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20">
                    <Save className="w-4 h-4" />
                    Save Configuration
                </button>
            </div>

            <div className="space-y-6">
                {/* Global Meta Tags */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        Global Meta Tags
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest pl-1 mb-2 block">Default Meta Title</label>
                            <input 
                                defaultValue="AmisiMedOS - Intelligent Hospital Management System"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest pl-1 mb-2 block">Default Meta Description</label>
                            <textarea 
                                defaultValue="AmisiMedOS provides a secure, cloud-based platform for hospitals and clinics to manage patients, billing, and clinical workflows efficiently."
                                rows={3}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest pl-1 mb-2 block">Meta Keywords (Comma separated)</label>
                            <input 
                                defaultValue="hospital management, EHR, clinical software, medical billing, AmisiMedOS"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Graph Settings */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-gray-400" />
                        Open Graph & Social Cards
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest pl-1 mb-2 block">OG:Title</label>
                                <input 
                                    defaultValue="AmisiMedOS"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest pl-1 mb-2 block">OG:Image URL</label>
                                <input 
                                    defaultValue="https://cdn.amisimedos.com/og-image.jpg"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest pl-1 mb-2 block">Twitter Handle</label>
                                <input 
                                    defaultValue="@AmisiMedOS"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>
                        <div className="border-l border-gray-800 pl-6 hidden md:block">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Social Preview</p>
                            <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-800/50">
                                <div className="h-32 bg-gray-700 flex items-center justify-center">
                                    <Globe className="w-8 h-8 text-gray-500" />
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-emerald-500 mb-1">amisimedos.com</p>
                                    <p className="font-bold text-white text-sm">AmisiMedOS - Intelligent Hospital System</p>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">AmisiMedOS provides a secure, cloud-based platform for hospitals and clinics...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Tracking */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-gray-400" />
                        External Tracking & Analytics
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest pl-1 mb-2 block">Google Analytics (G-XXXXXXX)</label>
                            <input 
                                placeholder="e.g. G-1234567890"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest pl-1 mb-2 block">Facebook Pixel ID</label>
                            <input 
                                placeholder="e.g. 123456789012345"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
