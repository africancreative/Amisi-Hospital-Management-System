'use client';

import { useState, useEffect } from 'react';
import { 
    Zap, 
    Save, 
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { 
    getGlobalSettings, 
    updateGlobalSettings 
} from '@/app/actions/core-actions';

export function LandingContentCMS() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [settings, setSettings] = useState({
        heroTitle: '',
        heroSubtitle: '',
        heroCTA: '',
        heroImageUrl: '',
        showHero: true,
        showFeatures: true,
        
        feature1Title: '',
        feature1Desc: '',
        feature1Icon: '',
        
        feature2Title: '',
        feature2Desc: '',
        feature2Icon: '',
        
        feature3Title: '',
        feature3Desc: '',
        feature3Icon: '',
    });

    useEffect(() => {
        getGlobalSettings().then(res => {
            setSettings(prev => ({ 
                ...prev, 
                heroTitle: res.heroTitle || '',
                heroSubtitle: res.heroSubtitle || '',
                heroCTA: res.heroCTA || '',
                heroImageUrl: res.heroImageUrl || '',
                showHero: res.showHero ?? true,
                showFeatures: res.showFeatures ?? true,
                
                feature1Title: res.feature1Title || '',
                feature1Desc: res.feature1Desc || '',
                feature1Icon: res.feature1Icon || '',
                
                feature2Title: res.feature2Title || '',
                feature2Desc: res.feature2Desc || '',
                feature2Icon: res.feature2Icon || '',
                
                feature3Title: res.feature3Title || '',
                feature3Desc: res.feature3Desc || '',
                feature3Icon: res.feature3Icon || '',
            }));
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateGlobalSettings(settings);
            alert('Frontend CMS content synchronized successfully.');
        } catch (err) {
            alert('Failed to save CMS settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse font-bold uppercase tracking-widest text-xs">Loading CMS Data...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Zap className="h-8 w-8 text-amber-500" />
                        Website CMS
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Manage your public-facing landing page content.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    PUBLISH
                </button>
            </div>

            {/* Hero Section Management */}
            <section className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em]">Hero Section</h3>
                    <button 
                        onClick={() => setSettings({ ...settings, showHero: !settings.showHero })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.showHero ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}
                    >
                        {settings.showHero ? 'Visible' : 'Hidden'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Hero Title (H1)</label>
                        <input 
                            value={settings.heroTitle}
                            onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Hero CTA Text</label>
                        <input 
                            value={settings.heroCTA}
                            onChange={e => setSettings({ ...settings, heroCTA: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Hero Subtitle / Description</label>
                        <textarea 
                            value={settings.heroSubtitle}
                            onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                        />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <ImageIcon className="h-3 w-3" />
                            Hero Image / Background URL
                        </label>
                        <input 
                            value={settings.heroImageUrl}
                            onChange={e => setSettings({ ...settings, heroImageUrl: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono text-xs"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section Management */}
            <section className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em]">Feature Edge cards</h3>
                    <button 
                        onClick={() => setSettings({ ...settings, showFeatures: !settings.showFeatures })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.showFeatures ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}
                    >
                        {settings.showFeatures ? 'Visible' : 'Hidden'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <FeatureEditor 
                        index={1} 
                        title={settings.feature1Title || ''} 
                        desc={settings.feature1Desc || ''} 
                        icon={settings.feature1Icon || ''}
                        onChange={(field, val) => setSettings({ ...settings, [`feature1${field}`]: val })}
                    />
                    <FeatureEditor 
                        index={2} 
                        title={settings.feature2Title || ''} 
                        desc={settings.feature2Desc || ''} 
                        icon={settings.feature2Icon || ''}
                        onChange={(field, val) => setSettings({ ...settings, [`feature2${field}`]: val })}
                    />
                    <FeatureEditor 
                        index={3} 
                        title={settings.feature3Title || ''} 
                        desc={settings.feature3Desc || ''} 
                        icon={settings.feature3Icon || ''}
                        onChange={(field, val) => setSettings({ ...settings, [`feature3${field}`]: val })}
                    />
                </div>
            </section>
        </div>
    );
}

function FeatureEditor({ index, title, desc, icon, onChange }: { index: number; title: string; desc: string; icon: string; onChange: (field: string, val: string) => void; }) {
    return (
        <div className="space-y-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all">
            <label className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest">Card #{index}</label>
            <div className="space-y-3">
                <input 
                    placeholder="Feature Title"
                    value={title}
                    onChange={e => onChange('Title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
                <input 
                    placeholder="Lucide Icon Name"
                    value={icon}
                    onChange={e => onChange('Icon', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px] font-mono focus:outline-none focus:border-amber-500/50"
                />
                <textarea 
                    placeholder="Short description..."
                    value={desc}
                    onChange={e => onChange('Desc', e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50 resize-none"
                />
            </div>
        </div>
    );
}
