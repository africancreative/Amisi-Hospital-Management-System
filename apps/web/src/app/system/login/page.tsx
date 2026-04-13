'use server';

import { loginSystemAdmin } from '../../actions/auth-actions';
import { getGlobalSettings } from '../../actions/system-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button, Label } from '@amisimedos/ui';
import { ShieldCheck } from 'lucide-react';

export default async function SystemLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; msg?: string }> }) {
    const settings = await getGlobalSettings();
    const { error, msg } = await searchParams;

    const errorMessages: Record<string, string> = {
        'invalid': 'Access Denied: Invalid administrator credentials or security token.',
        'missing': 'Missing Credentials: Both email and security token are required.',
        'system': `System Exception: ${msg || 'An internal error occurred during authentication.'}`
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden">
            {/* Background Decorations - Royal Blue & Amber Theme */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md p-6 relative z-10 font-sans">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                        <img
                            src="/logo.png"
                            alt="Amisi MedOS Logo"
                            className="h-10 w-10 object-contain rounded-lg"
                        />
                        <span className="text-xl font-bold text-white tracking-tight italic uppercase tracking-tighter">
                            {settings.platformName || 'AmisiMedOS'}
                        </span>
                    </div>
                </div>

                <Card className="bg-neutral-900/50 border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="pb-8">
                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-4 duration-500">
                                <p className="text-xs font-black text-red-400 uppercase tracking-widest leading-relaxed">
                                    {errorMessages[error] || 'Unknown Security Exception Intercepted'}
                                </p>
                            </div>
                        )}
                        <div className="flex justify-center mb-6">
                            <img
                                src="/logo.png"
                                alt="Amisi MedOS"
                                className="h-16 w-16 object-contain drop-shadow-xl"
                            />
                        </div>
                        <CardTitle className="text-3xl text-center text-white">System Access</CardTitle>
                        <CardDescription className="text-center pt-2 text-neutral-400">
                            {settings.platformSlogan || 'Internal administration portal for the distributed network'}
                        </CardDescription>
                    </CardHeader>
                    <form action={loginSystemAdmin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-neutral-300 ml-1">Administrator Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@amisigenuine.com"
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-neutral-300 ml-1">Security Token</Label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Enter secure password"
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-12"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-12 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 mt-4 active:scale-[0.98]"
                            >
                                Authenticate
                            </Button>
                        </CardContent>
                    </form>
                </Card>

                <p className="mt-8 text-center text-neutral-500 text-sm">
                    AmisiMedOS Distributed Infrastructure v4.0
                </p>
                <div className="mt-4 text-center">
                    <a href="/login" className="text-xs text-neutral-600 hover:text-blue-400 transition-colors">
                        Return to Hospital Staff Login
                    </a>
                </div>
            </div>
        </div>
    );
}
