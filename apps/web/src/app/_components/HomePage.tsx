import {
  Building2, ShieldCheck, ArrowRight, Activity, Users, Zap,
  CheckCircle2, Lock, Stethoscope, FlaskConical, Pill, HeartPulse,
  BedDouble, CreditCard, BarChart3, Microscope, Radio, Truck,
  MessageSquare, ClipboardList, UserCog, Globe2, Cpu, ScanLine,
  Baby, Bone, Layers3, Server, Download, RefreshCw, Stethoscope as ClinicIcon
} from "lucide-react";
import Link from "next/link";
import { getGlobalSettings } from "../actions/system-actions";
import { cookies } from "next/headers";
import { getControlDb } from "@/lib/db";

export default async function LandingPage() {
  const settings = await getGlobalSettings();
  const cookieStore = await cookies();
  let tenantSlug = cookieStore.get('amisi-tenant-slug')?.value;
  const tenantId = cookieStore.get('amisi-tenant-id')?.value;
  const userRole = cookieStore.get('amisi-user-role')?.value;

  if (!tenantSlug && tenantId && userRole) {
    try {
      const controlDb = getControlDb();
      const tenant = await controlDb.tenant.findUnique({ where: { id: tenantId } });
      if (tenant) tenantSlug = tenant.slug;
    } catch (e) {
      console.warn("Could not fetch tenant slug from DB. DB might be unavailable.");
    }
  }

  return (
    <div className="flex-1 bg-[#07070a] text-white selection:bg-amber-500/30 overflow-x-hidden">
      <main>
        {/* ── Hero ── */}
        <section className="relative pt-24 pb-20 md:pb-36 overflow-hidden">
          {/* Glows */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          {settings.heroImageUrl && (
            <img
              src={settings.heroImageUrl}
              alt=""
              className="absolute inset-0 opacity-10 object-cover"
            />
          )}

          <div className="max-w-7xl mx-auto px-6 relative text-center lg:text-left grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 md:mb-8">
                <Zap className="h-3 w-3 fill-current" />
                {settings.platformSlogan || 'Next-Generation Healthcare OS'}
              </div>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.05] lg:leading-[0.9]">
                {settings.heroTitle || (
                  <>Enterprise Hospital<br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-amber-400">
                      Management
                    </span>{' '}
                    for Africa.
                  </>
                )}
              </h1>
              <p className="text-lg md:text-xl text-neutral-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                {settings.heroSubtitle ||
                  `${settings.platformName} converts your visitors into paying tenants. A hybrid-cloud hospital operating system built for African healthcare providers. Cloud-first, offline-resilient, SOP-compliant.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/pricing"
                  className="px-8 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-lg hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 w-full sm:w-auto"
                >
                  Start Free Trial
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-2xl bg-neutral-900 border border-white/10 text-white font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
                >
                  Staff Login
                </Link>
              </div>
            </div>

            {/* Slider / Graphic */}
            <div className="hidden lg:flex items-center justify-center w-full">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-600/20 to-amber-500/20 blur-3xl scale-150" />
                
                {/* USP Slider Simulation */}
                <div className="relative z-10 w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        </div>
                        <span className="text-xs font-mono text-neutral-500">amisimed.os</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Activity className="text-emerald-400 h-8 w-8 shrink-0" />
                            <div>
                                <p className="font-bold text-sm text-white">Real-time Sync</p>
                                <p className="text-xs text-neutral-400">Zero latency across departments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Layers3 className="text-blue-400 h-8 w-8 shrink-0" />
                            <div>
                                <p className="font-bold text-sm text-white">Offline Resilience</p>
                                <p className="text-xs text-neutral-400">Keep operating without internet</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <ShieldCheck className="text-amber-400 h-8 w-8 shrink-0" />
                            <div>
                                <p className="font-bold text-sm text-white">HIPAA Compliant</p>
                                <p className="text-xs text-neutral-400">Enterprise-grade security</p>
                            </div>
                        </div>
                    </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── Solutions ── */}
        <section className="py-20 md:py-24 border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Solutions</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase">Built For Your Facility</h2>
              <p className="text-neutral-500 mt-4 max-w-2xl mx-auto">
                No matter your size or specialty, AmisiMedOS adapts to provide exactly what you need.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FacilityCard 
                icon={ClinicIcon} 
                title="Clinics" 
                desc="Streamline patient queues, basic billing, and out-patient records in one easy interface."
                color="blue"
              />
              <FacilityCard 
                icon={Pill} 
                title="Pharmacies" 
                desc="Manage inventory, track expiring drugs, and handle POS with integrated insurance."
                color="emerald"
              />
              <FacilityCard 
                icon={Microscope} 
                title="Laboratories" 
                desc="Automate test reporting, integrate with lab machines, and flag critical results instantly."
                color="amber"
              />
              <FacilityCard 
                icon={Building2} 
                title="Hospitals" 
                desc="Full-scale ERP: Inpatient, Maternity, Surgery, HR, and multi-branch management."
                color="rose"
              />
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-20 md:py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Core Features</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase">The Amisi Edge</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <FeatureRow 
                    icon={Globe2} 
                    title="Offline-First Resilience" 
                    desc="Internet drops shouldn't stop healthcare. Our hybrid local node ensures your hospital runs at 100% capacity offline, syncing seamlessly when connectivity returns." 
                />
                <FeatureRow 
                    icon={CreditCard} 
                    title="Integrated Billing" 
                    desc="Stop revenue leaks. Automated charge capture at every touchpoint, integrated with local insurance, M-Pesa, and standard payment gateways." 
                />
                <FeatureRow 
                    icon={ClipboardList} 
                    title="Comprehensive EMR" 
                    desc="Full patient history, clinical notes, ICD-11 coding, and e-prescriptions. Built to match clinician workflows instead of slowing them down." 
                />
                <FeatureRow 
                    icon={Truck} 
                    title="Smart Inventory" 
                    desc="Real-time tracking of drugs and consumables across multiple stores. Automated reorder alerts prevent stockouts of critical supplies." 
                />
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-20 md:py-24 border-t border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 md:mb-16">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Workflow</p>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase">How It Works</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0"></div>

                    <StepCard step="1" icon={Download} title="Install" desc="Sign up and instantly access your cloud dashboard. Optional: Deploy our local node on any PC in your facility." />
                    <StepCard step="2" icon={Activity} title="Operate" desc="Register patients, prescribe drugs, and bill seamlessly. The system runs blazingly fast on your local network." />
                    <StepCard step="3" icon={RefreshCw} title="Sync" desc="Background CRDT-engine pushes data securely to the cloud whenever internet is available. No conflicts." />
                </div>
            </div>
        </section>

        {/* ── Pricing Tiers ── */}
        <section className="py-20 md:py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Pricing</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase">Plans for Every Scale</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  tier: 'Essential',
                  price: '$24.50',
                  period: '/mo',
                  desc: 'Perfect for clinics and private practices.',
                  modules: ['OPD', 'Pharmacy', 'Basic Billing', 'Basic Reporting'],
                  color: 'neutral',
                  featured: false,
                  planKey: 'ESSENTIAL'
                },
                {
                  tier: 'Professional',
                  price: '$64.50',
                  period: '/mo',
                  desc: 'Full-featured for general hospitals.',
                  modules: ['Everything in Essential', 'Emergency & IPD', 'Laboratory & RIS', 'HR Module', 'Staff Chat'],
                  color: 'blue',
                  featured: true,
                  planKey: 'PROFESSIONAL'
                },
                {
                  tier: 'Enterprise',
                  price: '$149.50',
                  period: '/mo',
                  desc: 'For hospital groups and teaching hospitals.',
                  modules: ['Everything in Professional', 'Supply Chain', 'Payroll Engine', 'Surgical Theatre', 'Multi-Facility'],
                  color: 'amber',
                  featured: false,
                  planKey: 'ENTERPRISE'
                },
              ].map((p: any) => (
                <div
                  key={p.tier}
                  className={`rounded-3xl p-8 relative overflow-hidden border transition-all flex flex-col ${p.featured ? 'bg-linear-to-b from-blue-600/20 to-blue-900/10 border-blue-500/40 shadow-2xl shadow-blue-600/10 md:scale-[1.05] z-10' : 'bg-white/2 border-white/5 hover:border-white/10'}`}
                >
                  {p.featured && (
                    <div className="absolute top-0 right-0 px-4 py-2 bg-blue-600 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">Most Popular</div>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${p.color === 'blue' ? 'text-blue-400' : p.color === 'amber' ? 'text-amber-400' : 'text-neutral-400'}`}>{p.tier}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <p className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">{p.price}</p>
                    <span className="text-neutral-500 font-bold">{p.period}</span>
                  </div>
                  <p className="text-neutral-500 text-sm mb-8">{p.desc}</p>
                  <ul className="space-y-3 mb-10 flex-1">
                    {p.modules.map((m: any) => (
                      <li key={m} className="flex items-center gap-2 text-sm text-neutral-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/checkout?plan=${p.planKey}&period=monthly`}
                    className={`block w-full text-center py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${p.featured ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                  >
                    Create Your Account
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-24 md:py-32 border-t border-white/5 bg-linear-to-b from-transparent to-blue-900/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Zap className="h-3 w-3 fill-current" /> Ready to Deploy?
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase mb-8 leading-[0.9]">
              Transform Your<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-amber-400">Hospital Today.</span>
            </h2>
            <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
              Join leading African hospitals already running on {settings.platformName}. Start your free trial today and our team will guide you through onboarding.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-xl hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-2xl shadow-blue-600/40 w-full sm:w-auto"
                >
                Create Your Account
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20"><ArrowRight className="h-5 w-5" /></span>
                </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain rounded-lg opacity-80" />
              <div>
                <span className="block text-sm font-black tracking-tighter uppercase italic text-white">{settings.platformName}</span>
                <span className="block text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Cloud Hospital OS</span>
              </div>
            </div>
            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm w-full md:w-auto">
              <div>
                <p className="font-black text-white text-[10px] uppercase tracking-widest mb-3">Platform</p>
                <ul className="space-y-2 text-neutral-500">
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Hospital Login</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-black text-white text-[10px] uppercase tracking-widest mb-3">Company</p>
                <ul className="space-y-2 text-neutral-500">
                  <li><a href="mailto:amisi@amisigenuine.com" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="mailto:support@amisigenuine.com" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              <div>
                <p className="font-black text-white text-[10px] uppercase tracking-widest mb-3">Legal</p>
                <ul className="space-y-2 text-neutral-500">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5 text-center md:text-left">
            <p className="text-neutral-600 text-sm">© {new Date().getFullYear()} {settings.platformName} Systems. All rights reserved.</p>
            {/* Padlock — hidden system admin entry */}
            <Link
              href="/system/login"
              id="system-admin-padlock"
              title="System Administration"
              className="text-neutral-800 hover:text-neutral-500 transition-colors duration-300"
            >
              <Lock className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FacilityCard({ icon: Icon, title, desc, color }: any) {
    const colorStyles: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };
    return (
        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colorStyles[color]} group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 italic uppercase">{title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}

function FeatureRow({ icon: Icon, title, desc }: any) {
    return (
        <div className="flex items-start gap-6 p-6 rounded-3xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center shrink-0 text-white">
                <Icon size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">{desc}</p>
            </div>
        </div>
    )
}

function StepCard({ step, icon: Icon, title, desc }: any) {
    return (
        <div className="relative z-10 flex flex-col items-center text-center p-6">
            <div className="w-20 h-20 rounded-full bg-neutral-950 border-4 border-[#07070a] shadow-[0_0_0_2px_rgba(255,255,255,0.1)] flex items-center justify-center text-blue-400 mb-6 relative">
                <Icon size={32} />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-black flex items-center justify-center border-4 border-[#07070a]">
                    {step}
                </div>
            </div>
            <h3 className="text-2xl font-black italic uppercase mb-3">{title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">{desc}</p>
        </div>
    )
}
