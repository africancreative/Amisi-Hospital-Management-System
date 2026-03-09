'use server';

import { loginHospitalUser } from '../actions/auth-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Hospital } from 'lucide-react';

export default async function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden">
            {/* Background Decorations - Royal Blue & Amber Theme */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md p-6 relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Hospital className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Amisi Genuine</span>
                    </div>
                </div>

                <Card className="bg-neutral-900/50 border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="space-y-1 pb-8">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-xl shadow-amber-500/20">
                                <span className="text-2xl font-bold text-white">G</span>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white text-center">Hospital Staff Login</CardTitle>
                        <CardDescription className="text-neutral-400 text-center">
                            Enter your credentials to access your hospital dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={loginHospitalUser} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-neutral-300 ml-1">Hospital Slug</Label>
                                <Input
                                    name="tenantSlug"
                                    placeholder="e.g. amisi-premier"
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-neutral-300 ml-1">Email Address</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="doctor@amisigenuine.com"
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-neutral-300 ml-1">Password</Label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-12"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-12 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 mt-4 active:scale-[0.98]"
                            >
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-neutral-500 text-sm">
                    Protected by Amisi Genuine Security Protocol v2.4
                </p>
                <div className="mt-4 text-center">
                    <a href="/system/login" className="text-xs text-neutral-600 hover:text-amber-500 transition-colors">
                        Platform Administration Portal
                    </a>
                </div>
            </div>
        </div>
    );
}
