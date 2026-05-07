import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { getGlobalSettings } from '../actions/core-actions';

export default async function TermsPage() {
  const settings = await getGlobalSettings();

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-amber-500/30">
      
      {/* Basic Navigation */}
      <nav className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="h-4 w-4 text-neutral-400 group-hover:text-white" />
            </div>
            <span className="text-sm font-bold text-neutral-400 group-hover:text-white transition-colors">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain rounded-lg" />
            <span className="text-sm font-black tracking-tighter uppercase italic">{settings.platformName}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
            <FileText className="h-3 w-3 fill-current" /> Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Terms of Service.</h1>
          <p className="text-neutral-400 text-lg">Last updated: April 2026</p>
        </div>

        <div className="prose prose-invert prose-amber max-w-none prose-headings:font-black prose-p:text-neutral-400 prose-a:text-amber-400">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the {settings.platformName} system, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you do not have permission to access the Service.
          </p>

          <h2>2. Enterprise Licensing & Local Nodes</h2>
          <p>
            {settings.platformName} grants your organization a revocable, non-exclusive, non-transferable, limited license to use our cloud platform and deploy Local Edge Nodes within your hospital network infrastructure. We retain full intellectual property rights to the core routing, CRDT sync engines, and UI schemas.
          </p>

          <h2>3. Clinical Responsibility</h2>
          <p>
            Our software provides clinical decision support tools (e.g., NEWS2 scoring, drug interaction flags). However, <strong>these tools do not replace professional medical judgment</strong>. The healthcare provider assumes full responsibility for the clinical care provided to patients. {settings.platformName} shall not be held liable for clinical misdiagnoses or adverse patient outcomes resulting from user dependencies on software alerts.
          </p>

          <h2>4. Offline Resilience and Sync</h2>
          <p>
            While our platform is designed to operate seamlessly during internet and LAN outages, you are responsible for providing basic physical server infrastructure (if utilizing a Local Node) and ensuring the Local Node is powered to facilitate offline documentation.
          </p>

          <h2>5. Data Ownership</h2>
          <p>
            The hospital organization retains complete ownership of all Patient Health Information (PHI), records, and financial ledgers entered into the system. Upon termination of service, we will provide a complete, secure export of your isolated tenant database.
          </p>

          <h2>6. Platform Availability</h2>
          <p>
            We strive for 99.9% cloud uptime. In the event of cloud downtime, operations must gracefully failover to the Local Edge Node. We are not liable for business interruptions caused by acts of God, widespread internet provider failures in your region, or hardware failure of the on-premise local node device.
          </p>

          <h2>7. Contact Information</h2>
          <p>
            For legal inquiries or clarifications regarding these terms, please contact:
            <br />
            <a href="mailto:legal@amisigenuine.com">legal@amisigenuine.com</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 text-center bg-black/20">
        <p className="text-neutral-600 text-sm">© {new Date().getFullYear()} {settings.platformName} Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
