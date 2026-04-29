import {
  Building2, ShieldCheck, ArrowRight, Activity, Users, Zap,
  CheckCircle2, Lock, Stethoscope, FlaskConical, Pill, HeartPulse,
  BedDouble, CreditCard, BarChart3, Microscope, Radio, Truck,
  MessageSquare, ClipboardList, UserCog, Globe2, Cpu, ScanLine,
  Baby, Bone, Layers3
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
  const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

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
        {settings.showHero && (
          <section className="relative pt-24 pb-36 overflow-hidden">
            {/* Glows */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            {settings.heroImageUrl && (
              <div
                className="absolute inset-0 opacity-5 bg-cover bg-center grayscale"
                style={{ backgroundImage: `url(${settings.heroImageUrl})` }}
              />
            )}

            <div className="max-w-7xl mx-auto px-6 relative grid lg:grid-cols-2 gap-16 items-center">
              {/* Text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                  <Zap className="h-3 w-3 fill-current" />
                  {settings.platformSlogan || 'Next-Generation Healthcare OS'}
                </div>
                <h1 className="text-6xl xl:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                  {settings.heroTitle || (
                    <>Enterprise Hospital<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">
                        Management
                      </span>{' '}
                      for Africa.
                    </>
                  )}
                </h1>
                <p className="text-xl text-neutral-400 leading-relaxed mb-12 max-w-xl">
                  {settings.heroSubtitle ||
                    `${settings.platformName} is a hybrid-cloud hospital operating system built for African and emerging-market healthcare providers. Cloud-first, offline-resilient, SOP-compliant.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/request"
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3"
                  >
                    {settings.heroCTA || 'Request Enterprise Access'}
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 rounded-2xl bg-neutral-900 border border-white/10 text-white font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-3"
                  >
                    Staff Login
                  </Link>
                </div>
              </div>

              {/* Logo Hero Graphic */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/20 to-amber-500/20 blur-3xl scale-150" />
                  <img
                    src="/logo.png"
                    alt="Amisi MedOS"
                    className="relative z-10 w-72 h-72 object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Stats Strip */}
            <div className="max-w-7xl mx-auto px-6 mt-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Clinical Modules', value: '20+' },
                  { label: 'Supported Regions', value: '3' },
                  { label: 'Avg. Uptime', value: '99.9%' },
                  { label: 'Offline Resilient', value: '100%' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center backdrop-blur-sm">
                    <p className="text-4xl font-black text-white mb-1">{s.value}</p>
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Platform Architecture ── */}
        <section className="py-24 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Architecture</p>
              <h2 className="text-4xl font-black tracking-tighter italic uppercase">Hybrid-Cloud by Design</h2>
              <p className="text-neutral-500 mt-4 max-w-2xl mx-auto">
                A cloud-first platform with optional on-premise local nodes — ensuring clinical continuity even when the internet goes down.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe2,
                  color: 'blue',
                  title: 'Cloud SaaS',
                  desc: 'Multi-tenant Next.js application deployed on Vercel with per-hospital isolated Neon Postgres databases. Zero DevOps required.',
                  tags: ['Next.js 15', 'Neon Postgres', 'Vercel'],
                },
                {
                  icon: Cpu,
                  color: 'amber',
                  title: 'Local Node',
                  desc: 'Electron + Next.js local server for LAN-based offline failover. Full clinical operations during internet outages.',
                  tags: ['Electron', 'PostgreSQL', 'LAN Server'],
                },
                {
                  icon: Activity,
                  color: 'emerald',
                  title: 'Sync Engine',
                  desc: 'CRDT-based delta synchronization between cloud and local nodes. Conflict-free, auditable, and HIPAA-compliant.',
                  tags: ['Hono', 'CRDTs', 'Real-time'],
                },
              ].map(c => (
                <div key={c.title} className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 group hover:border-white/10 transition-all hover:bg-white/[0.04]">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${c.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : c.color === 'amber' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'} group-hover:scale-110 transition-transform`}>
                    <c.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black mb-3">{c.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-5">{c.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map(t => (
                      <span key={t} className="px-2 py-1 rounded-lg bg-white/5 text-[9px] font-black text-neutral-400 uppercase tracking-widest border border-white/5">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Core Features ── */}
        {settings.showFeatures && (
          <section className="py-24 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Core Platform</p>
                <h2 className="text-4xl font-black tracking-tighter italic uppercase">The {settings.platformName.split(' ')[0]} Edge</h2>
                <p className="text-neutral-500 mt-4 max-w-2xl mx-auto">
                  Built from the ground up for the realities of African healthcare infrastructure.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <FeatureCard
                  icon={ShieldCheck}
                  title={settings.feature1Title || "Secure Multi-Tenancy"}
                  description={settings.feature1Desc || "Each hospital operates in a completely isolated database environment with enterprise-grade encryption and HIPAA-compliant audit trails."}
                  color="blue"
                />
                <FeatureCard
                  icon={Activity}
                  title={settings.feature2Title || "Live Clinical Flow"}
                  description={settings.feature2Desc || "Monitor patient queues, lab results, and pharmacy inventory in real-time with zero latency. WebSocket-powered real-time boards."}
                  color="emerald"
                />
                <FeatureCard
                  icon={Users}
                  title={settings.feature3Title || "Role-Based Access"}
                  description={settings.feature3Desc || "Granular RBAC ensures doctors, nurses, pharmacists, and accountants see exactly what they need — nothing more."}
                  color="amber"
                />
                <FeatureCard
                  icon={Layers3}
                  title="Offline-First Resilience"
                  description="Full clinical operations continue during internet outages via the local node. Automatic background sync when connectivity returns."
                  color="indigo"
                />
                <FeatureCard
                  icon={CreditCard}
                  title="Integrated Revenue Cycle"
                  description="Charge-at-every-step billing engine with NHIF/SHA insurance integration, M-Pesa, and Stripe payment processing."
                  color="rose"
                />
                <FeatureCard
                  icon={ScanLine}
                  title="Full Audit Compliance"
                  description="Every clinical action is timestamped and logged. HIPAA-grade audit trails with automated anomaly detection and alerts."
                  color="blue"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Clinical Modules Grid ── */}
        <section className="py-24 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Clinical Modules</p>
              <h2 className="text-4xl font-black tracking-tighter italic uppercase mb-4">Everything Your Hospital Needs</h2>
              <p className="text-neutral-500 text-lg leading-relaxed">
                20+ integrated modules covering every department — from outpatient registration to surgical theatre management.
                Enable only what you need; scale as you grow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: ClipboardList, name: 'OPD', fullName: 'Outpatient', desc: 'Registration, queue, triage, e-prescription', tier: 'Starter' },
                { icon: HeartPulse, name: 'ED', fullName: 'Emergency', desc: 'ESI triage scoring, real-time resuscitation board', tier: 'Professional' },
                { icon: BedDouble, name: 'IPD', fullName: 'Inpatient', desc: 'Admissions, bed maps, daily ward rounds, discharge', tier: 'Professional' },
                { icon: FlaskConical, name: 'LIS', fullName: 'Laboratory', desc: 'Sample tracking, auto-flagging, critical alerts', tier: 'Professional' },
                { icon: Pill, name: 'PharmOS', fullName: 'Pharmacy', desc: 'Dispense workflow, drug interactions, inventory', tier: 'Starter' },
                { icon: Radio, name: 'RIS', fullName: 'Radiology', desc: 'DICOM-ready orders, report storage, AI assist', tier: 'Professional' },
                { icon: CreditCard, name: 'RCM', fullName: 'Revenue Cycle', desc: 'Insurance, copays, NHIF, M-Pesa, Stripe', tier: 'Starter' },
                { icon: Microscope, name: 'HIM', fullName: 'Health Info Mgmt', desc: 'ICD-11 coding, MRN, clinical records vault', tier: 'Enterprise' },
                { icon: MessageSquare, name: 'Chat', fullName: 'Staff Chat', desc: 'Secure messaging, multimedia, department channels', tier: 'Professional' },
                { icon: Truck, name: 'SCM', fullName: 'Supply Chain', desc: 'Procurement, GRN, vendor management, reorder alerts', tier: 'Enterprise' },
                { icon: UserCog, name: 'HR', fullName: 'Human Resources', desc: 'Employee records, contracts, leave, attendance', tier: 'Professional' },
                { icon: BarChart3, name: 'Payroll', fullName: 'Payroll Engine', desc: 'Automated payslips, PAYE, NHIF, NSSF deductions', tier: 'Enterprise' },
                { icon: Baby, name: 'Maternity', fullName: 'Maternity & MCH', desc: 'Antenatal, delivery tracking, postnatal care', tier: 'Professional' },
                { icon: Stethoscope, name: 'ICU / HDU', fullName: 'Critical Care', desc: 'Continuous vitals, ventilator charts, NEWS2 scoring', tier: 'Enterprise' },
                { icon: Bone, name: 'OT', fullName: 'Surgical Theatre', desc: 'Scheduling, consent, intraop notes, anaesthesia', tier: 'Enterprise' },
                { icon: Building2, name: 'Multi-Facility', fullName: 'Network View', desc: 'Manage chains, shared formularies, consolidated reports', tier: 'Enterprise' },
              ].map(m => (
                <ModuleCard key={m.name} {...m} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Subscription Tiers ── */}
        <section className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Pricing</p>
              <h2 className="text-4xl font-black tracking-tighter italic uppercase">Plans for Every Scale</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  tier: 'Starter',
                  price: 'Contact Sales',
                  desc: 'Perfect for clinics and private practices.',
                  modules: ['OPD', 'Pharmacy / PharmOS', 'Revenue Cycle (RCM)', 'Patient Index (PMI)', 'Basic Reporting'],
                  color: 'neutral',
                  featured: false,
                },
                {
                  tier: 'Professional',
                  price: 'Contact Sales',
                  desc: 'Full-featured for general hospitals.',
                  modules: ['Everything in Starter', 'Emergency (ED)', 'Inpatient (IPD)', 'Laboratory (LIS)', 'Radiology (RIS)', 'HR Module', 'Maternity & MCH', 'Staff Chat', 'ICU / Critical Care'],
                  color: 'blue',
                  featured: true,
                },
                {
                  tier: 'Enterprise',
                  price: 'Custom',
                  desc: 'For hospital groups and teaching hospitals.',
                  modules: ['Everything in Professional', 'Health Info Mgmt (HIM)', 'Supply Chain (SCM)', 'Payroll Engine', 'Surgical Theatre (OT)', 'Multi-Facility Network', 'API Access', 'Local Node (Offline)'],
                  color: 'amber',
                  featured: false,
                },
              ].map(p => (
                <div
                  key={p.tier}
                  className={`rounded-3xl p-8 relative overflow-hidden border transition-all ${p.featured ? 'bg-gradient-to-b from-blue-600/20 to-blue-900/10 border-blue-500/40 shadow-2xl shadow-blue-600/10 scale-[1.02]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                >
                  {p.featured && (
                    <div className="absolute top-0 right-0 px-4 py-2 bg-blue-600 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">Most Popular</div>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${p.color === 'blue' ? 'text-blue-400' : p.color === 'amber' ? 'text-amber-400' : 'text-neutral-400'}`}>{p.tier}</p>
                  <p className="text-3xl font-black text-white mb-2">{p.price}</p>
                  <p className="text-neutral-500 text-sm mb-8">{p.desc}</p>
                  <ul className="space-y-3 mb-10">
                    {p.modules.map(m => (
                      <li key={m} className="flex items-center gap-2 text-sm text-neutral-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/request"
                    className={`block w-full text-center py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${p.featured ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Security & Compliance ── */}
        <section className="py-24 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Security</p>
              <h2 className="text-4xl font-black tracking-tighter italic uppercase mb-6">Enterprise-Grade Security & Compliance</h2>
              <p className="text-neutral-500 leading-relaxed mb-10">
                {settings.platformName} is built with security as a first-class feature — not an afterthought. Every access is authenticated, every action is logged.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'JWT + TOTP MFA', 'HIPAA Audit Trails', 'Per-Tenant Isolation', 'AES-256 Encryption',
                  'RBAC Access Controls', 'GDPR Compliant', 'Automatic Backups', 'Intrusion Detection',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-neutral-400">
                    <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-blue-600/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/5 bg-neutral-950 p-10 space-y-4 shadow-2xl font-mono text-xs">
                {[
                  { color: 'text-emerald-400', text: '[AUTH] System Admin login verified — session established' },
                  { color: 'text-blue-400', text: '[TENANT] Isolated DB cluster provisioned: amisi-premier' },
                  { color: 'text-amber-400', text: '[SYNC] Delta sync completed — 142 records reconciled' },
                  { color: 'text-neutral-400', text: '[AUDIT] User DR_JAMES accessed Patient #P-00432 — logged' },
                  { color: 'text-emerald-400', text: '[BILLING] Invoice #INV-9281 submitted to NHIF — accepted' },
                  { color: 'text-blue-400', text: '[LIS] Critical result flagged → Potassium 6.8 mEq/L → Alert sent' },
                ].map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-neutral-700 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className={line.color}>{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-32 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Zap className="h-3 w-3 fill-current" /> Ready to Deploy?
            </div>
            <h2 className="text-6xl font-black tracking-tighter italic uppercase mb-8 leading-[0.9]">
              Transform Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Hospital Today.</span>
            </h2>
            <p className="text-neutral-500 text-xl mb-12 max-w-2xl mx-auto">
              Join leading African hospitals already running on {settings.platformName}. Request access and our team will provision your instance within 24 hours.
            </p>
            <Link
              href="/request"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-2xl shadow-blue-600/40"
            >
              Request Enterprise Access
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20"><ArrowRight className="h-5 w-5" /></span>
            </Link>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <p className="font-black text-white text-[10px] uppercase tracking-widest mb-3">Platform</p>
                <ul className="space-y-2 text-neutral-500">
                  <li><Link href="/request" className="hover:text-white transition-colors">Request Access</Link></li>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
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

function FeatureCard({ icon: Icon, title, description, color = 'blue' }: {
  icon: any; title: string; description: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/10',
  };
  return (
    <div className="group p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border ${colorMap[color] || colorMap.blue} group-hover:scale-110 transition-transform`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-neutral-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function ModuleCard({ icon: Icon, name, fullName, desc, tier }: {
  icon: any; name: string; fullName: string; desc: string; tier: string;
}) {
  const tierColor = tier === 'Starter' ? 'text-emerald-400 bg-emerald-500/10' : tier === 'Professional' ? 'text-blue-400 bg-blue-500/10' : 'text-amber-400 bg-amber-500/10';
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 hover:bg-white/[0.04] transition-all hover:translate-y-[-2px]">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${tierColor}`}>{tier}</span>
      </div>
      <p className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-0.5">{name}</p>
      <p className="font-black text-white text-sm mb-2">{fullName}</p>
      <p className="text-[10px] text-neutral-600 leading-relaxed">{desc}</p>
    </div>
  );
}
