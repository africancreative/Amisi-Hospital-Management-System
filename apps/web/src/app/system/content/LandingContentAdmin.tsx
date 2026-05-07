'use client';

import React, { useState } from 'react';
import { uploadHeroImage } from '@/app/actions/upload-actions';
import { updateGlobalSettings } from '@/app/actions/system-actions';
import { Button } from '@amisimedos/ui';
import { ImagePlus, Save, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export default function LandingContentAdmin({ initialSettings }: { initialSettings: any }) {
    const [settings, setSettings] = useState(initialSettings || {});
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateGlobalSettings(settings);
            alert('Settings saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus('Uploading...');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadHeroImage(formData);
            if (res.success) {
                setSettings({ ...settings, heroImageUrl: res.url });
                setUploadStatus('Upload successful!');
            } else {
                setUploadStatus(`Error: ${res.error}`);
            }
        } catch (err: any) {
            setUploadStatus(`Error: ${err.message}`);
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadStatus(null), 3000);
        }
    };

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-black italic uppercase mb-2">Landing Page Content</h1>
                <p className="text-neutral-500">Manage the public-facing website content, Hero sections, and USPs.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                <h2 className="text-xl font-bold border-b border-slate-800 pb-2">Hero Section</h2>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Slogan</label>
                    <input 
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={settings.platformSlogan || ''}
                        onChange={e => setSettings({ ...settings, platformSlogan: e.target.value })}
                        placeholder="e.g. Next-Generation Healthcare OS"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hero Title</label>
                    <input 
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={settings.heroTitle || ''}
                        onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                        placeholder="e.g. Enterprise Hospital Management for Africa."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hero Subtitle</label>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                        value={settings.heroSubtitle || ''}
                        onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                        placeholder="A hybrid-cloud hospital operating system..."
                    />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Hero Background Image</label>
                    
                    {settings.heroImageUrl && (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-800 mb-4">
                            <img src={settings.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-mono flex items-center gap-1 backdrop-blur-sm">
                                <LinkIcon size={12} /> {settings.heroImageUrl.split('/').pop()}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer relative flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                            {isUploading ? 'Uploading...' : 'Upload Image via Vercel Blob'}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                        </label>
                        {uploadStatus && (
                            <span className={`text-sm ${uploadStatus.includes('Error') ? 'text-red-400' : 'text-emerald-400'} flex items-center gap-1`}>
                                {uploadStatus.includes('Error') ? null : <CheckCircle2 size={14} />}
                                {uploadStatus}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Content Settings
                </Button>
            </div>
        </div>
    );
}
