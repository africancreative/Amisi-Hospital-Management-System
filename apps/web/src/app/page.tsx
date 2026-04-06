import { Building2, ShieldCheck, ArrowRight, Activity, Users, Zap, CheckCircle2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { getGlobalSettings } from "./actions/system-actions";

export default async function LandingPage() {
  const settings = await getGlobalSettings();

  const getIcon = (name: string) => {
    const Icon = (LucideIcons as any)[name] || Activity;
    return Icon;
  };

  return (
    <div className="flex-1 bg-[#0a0a0b] text-white selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
               src={settings.platformLogoUrl || "/media__1775407355702.png"} 
               alt={`${settings.platformName} Logo`} 
               className="h-10 w-10 object-contain rounded-lg"
            />
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                {settings.platformName}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/system/login" className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors">
              Platform Administration
            </Link>
            <Link href="/login" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
              Hospital Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        {settings.showHero && (
            <section className="relative pt-20 pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
            
            {settings.heroImageUrl && (
                <div 
                    className="absolute inset-0 opacity-10 bg-cover bg-center grayscale"
                    style={{ backgroundImage: `url(${settings.heroImageUrl})` }}
                />
            )}

            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                    <Zap className="h-3 w-3 fill-current" /> {settings.platformSlogan || 'Next-Generation Healthcare'}
                </div>
                <h1 className="text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                    {settings.heroTitle || 'Enterprise Hospital Management for the Modern Era.'}
                </h1>
                <p className="text-xl text-neutral-400 leading-relaxed mb-12 max-w-2xl">
                    {settings.heroSubtitle || `${settings.platformName} provides a robust, hybrid-cloud infrastructure for modern hospitals. From clinical workflows to high-availability sync, we power the future of digital health.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                    <Link href="/request" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3">
                    {settings.heroCTA || 'Request Enterprise Access'} <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20"><ArrowRight className="h-4 w-4" /></span>
                    </Link>
                    <Link href="/system/login" className="px-8 py-4 rounded-2xl bg-neutral-900 border border-white/10 text-white font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-3">
                    System Admin
                    </Link>
                </div>
                </div>
            </div>
            </section>
        )}

        {/* Minimal Instructions/Features */}
        {settings.showFeatures && (
            <section className="py-24 border-t border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-black tracking-tight mb-16 text-center italic uppercase">The {settings.platformName.split(' ')[0]} Edge</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <FeatureCard 
                    icon={getIcon(settings.feature1Icon || 'ShieldCheck')} 
                    title={settings.feature1Title || "Secure Multi-Tenancy"} 
                    description={settings.feature1Desc || "Each hospital operates in a completely isolated database environment with enterprise-grade encryption."} 
                />
                <FeatureCard 
                    icon={getIcon(settings.feature2Icon || 'Activity')} 
                    title={settings.feature2Title || "Live Clinical Flow"} 
                    description={settings.feature2Desc || "Monitor patient queues, lab results, and pharmacy inventory in real-time with zero latency."} 
                />
                <FeatureCard 
                    icon={getIcon(settings.feature3Icon || 'Users')} 
                    title={settings.feature3Title || "Staff Autonomy"} 
                    description={settings.feature3Desc || "Role-based access ensures that doctors, nurses, and accountants see exactly what they need."} 
                />
                </div>
            </div>
            </section>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-xs italic">
                {(settings.platformName?.[0] || 'H').toUpperCase()}
            </div>
            <span className="text-sm font-black tracking-tighter uppercase italic">{settings.platformName}</span>
          </div>
          <p className="text-neutral-500 text-sm">© 2026 {settings.platformName} Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="group">
      <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-blue-500/10 to-amber-500/10 border border-white/5">
        <Icon className="h-7 w-7 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}
