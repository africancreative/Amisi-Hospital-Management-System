'use client';

import { useState, useEffect } from 'react';
import { 
    Globe, 
    Save, 
    CreditCard, 
    ShieldCheck, 
    Smartphone, 
    Zap, 
    CheckCircle2, 
    XCircle, 
    Loader2,
    Activity,
    Image as ImageIcon
} from 'lucide-react';
import { 
    getGlobalSettings, 
    updateGlobalSettings, 
    testPayPalConnection, 
    testMpesaConnection 
} from '@/app/actions/core-actions';

export function SystemSettingsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingPaypal, setTestingPaypal] = useState(false);
    const [testingMpesa, setTestingMpesa] = useState(false);
    
    const [settings, setSettings] = useState({
        platformName: 'AmisiMedOS',
        platformLogoUrl: '',
        platformSlogan: '',

        paypalClientId: '',
        paypalClientSecret: '',
        paypalEnv: 'sandbox',
        mpesaConsumerKey: '',
        mpesaConsumerSecret: '',
        mpesaPasskey: '',
        mpesaShortcode: '',
    });

    const [testResults, setTestResults] = useState<{
        paypal?: { success: boolean; message: string };
        mpesa?: { success: boolean; message: string };
    }>({});

    useEffect(() => {
        getGlobalSettings().then(res => {
            setSettings(prev => ({ 
                ...prev, 
                platformLogoUrl: res.platformLogoUrl || '',
                platformSlogan: res.platformSlogan || '',

                paypalClientId: res.paypalClientId || '',
                paypalClientSecret: res.paypalClientSecret || '',
                mpesaConsumerKey: res.mpesaConsumerKey || '',
                mpesaConsumerSecret: res.mpesaConsumerSecret || '',
                mpesaPasskey: res.mpesaPasskey || '',
                mpesaShortcode: res.mpesaShortcode || '',
            }));
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateGlobalSettings(settings);
            alert('Global configurations synchronized.');
        } catch (err) {
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleTestPaypal = async () => {
        setTestingPaypal(true);
        const res = await testPayPalConnection({
            clientId: settings.paypalClientId,
            clientSecret: settings.paypalClientSecret,
            env: settings.paypalEnv
        });
        setTestResults(prev => ({ ...prev, paypal: res }));
        setTestingPaypal(false);
    };

    const handleTestMpesa = async () => {
        setTestingMpesa(true);
        const res = await testMpesaConnection({
            key: settings.mpesaConsumerKey,
            secret: settings.mpesaConsumerSecret
        });
        setTestResults(prev => ({ ...prev, mpesa: res }));
        setTestingMpesa(false);
    };

    if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse font-bold uppercase tracking-widest text-xs">Decrypting platform environment...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Platform Branding */}
            <section className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Globe className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Global Platform branding</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Platform Identity</label>
                        <input 
                            value={settings.platformName}
                            onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                            placeholder="e.g. AmisiMedOS Enterprise"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Global Slogan</label>
                        <input 
                            value={settings.platformSlogan || ''}
                            onChange={e => setSettings({ ...settings, platformSlogan: e.target.value })}
                            placeholder="e.g. Intelligence in clinical orchestration"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium italic"
                        />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <ImageIcon className="h-3 w-3" />
                            Platform Logo URL (SVG preferred)
                        </label>
                        <input 
                            value={settings.platformLogoUrl || ''}
                            onChange={e => setSettings({ ...settings, platformLogoUrl: e.target.value })}
                            placeholder="https://cloud.amisi.com/logo.svg"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* PayPal Configuration */}
            <section className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">PayPal Gateway</h2>
                    </div>
                    <button 
                        onClick={handleTestPaypal}
                        disabled={testingPaypal}
                        className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl hover:bg-blue-500/20 transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                    >
                        {testingPaypal ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                        Test Connection
                    </button>
                </div>

                {testResults.paypal && (
                    <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${testResults.paypal.success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                        {testResults.paypal.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span className="text-xs font-bold uppercase tracking-widest">{testResults.paypal.message}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Client ID</label>
                        <input 
                            value={settings.paypalClientId || ''}
                            onChange={e => setSettings({ ...settings, paypalClientId: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none animate-in font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Client Secret</label>
                        <input 
                            type="password"
                            value={settings.paypalClientSecret || ''}
                            onChange={e => setSettings({ ...settings, paypalClientSecret: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Environment</label>
                        <select 
                             value={settings.paypalEnv}
                             onChange={e => setSettings({ ...settings, paypalEnv: e.target.value })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none appearance-none font-bold text-sm uppercase tracking-widest"
                        >
                            <option value="sandbox">Sandbox (Development)</option>
                            <option value="production">Production (Live)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* M-Pesa (Daraja) Configuration */}
            <section className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">M-Pesa (Daraja) API</h2>
                    </div>
                    <button 
                        onClick={handleTestMpesa}
                        disabled={testingMpesa}
                        className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                    >
                         {testingMpesa ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                        Verify Credentials
                    </button>
                </div>

                {testResults.mpesa && (
                    <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${testResults.mpesa.success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                        {testResults.mpesa.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span className="text-xs font-bold uppercase tracking-widest">{testResults.mpesa.message}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Consumer Key</label>
                        <input 
                            value={settings.mpesaConsumerKey || ''}
                            onChange={e => setSettings({ ...settings, mpesaConsumerKey: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Consumer Secret</label>
                        <input 
                            type="password"
                            value={settings.mpesaConsumerSecret || ''}
                            onChange={e => setSettings({ ...settings, mpesaConsumerSecret: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Passkey (LNM)</label>
                        <input 
                            value={settings.mpesaPasskey || ''}
                            onChange={e => setSettings({ ...settings, mpesaPasskey: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Paybill / Shortcode</label>
                        <input 
                            value={settings.mpesaShortcode || ''}
                            onChange={e => setSettings({ ...settings, mpesaShortcode: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold"
                        />
                    </div>
                </div>
            </section>

            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 px-8 rounded-3xl transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
            >
                {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                <span className="uppercase tracking-[0.2em] italic">Commit Global Configuration</span>
            </button>
        </div>
    );
}
