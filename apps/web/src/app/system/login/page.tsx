'use server';

import { loginSystemAdmin } from '../../actions/auth-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

export default async function SystemLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden">
            {/* Background Decorations - Royal Blue & Amber Theme */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md p-6 relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Amisi Genuine</span>
                    </div>
                </div>

                <Card className="bg-neutral-900/50 border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="pb-8">
                        <div className="flex justify-center mb-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-xl shadow-amber-500/20">
                                <span className="text-2xl font-bold text-white">G</span>
                            </div>
                        </div>
                        <CardTitle className="text-3xl text-center text-white">System Access</CardTitle>
                        <CardDescription className="text-center pt-2 text-neutral-400">
                            Internal administration portal for Amisi Genuine
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
                    Amisi Genuine Cloud Infrastructure v3.1
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
