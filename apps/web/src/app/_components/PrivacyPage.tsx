import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { getGlobalSettings } from '../actions/system-actions';

export default async function PrivacyPage() {
  const settings = await getGlobalSettings();

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-blue-500/30">
      
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Shield className="h-3 w-3 fill-current" /> Privacy Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How we protect your data.</h1>
          <p className="text-neutral-400 text-lg">Last updated: April 2026</p>
        </div>

        <div className="prose prose-invert prose-blue max-w-none prose-headings:font-black prose-p:text-neutral-400 prose-a:text-blue-400">
          <h2>1. Introduction</h2>
          <p>
            Welcome to {settings.platformName}. We are deeply committed to protecting the privacy and security of your hospital data, patient records, and personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our Hybrid Hospital System and related services.
          </p>

          <h2>2. Data We Collect</h2>
          <p>
            <strong>Hospital and Provider Data:</strong> When you register for our platform, we collect organization details, administrative user information, and billing details securely.
            <br/><br/>
            <strong>Patient Health Information (PHI):</strong> The core of our system is storing patient data. This includes electronic medical records (EMR), laboratory results, prescriptions, and billing histories.
            <br/><br/>
            <strong>Telemetry and Usage:</strong> For our Edge Node architecture to sync seamlessly, we collect diagnostic logs, uptime statistics, and local-network sync statuses to ensure offline resilience.
          </p>

          <h2>3. How We Use Data</h2>
          <p>We use the data collected strictly for the operational functionality of the hospital. We process data to:</p>
          <ul>
            <li>Provide continuous EMR access across cloud and local LAN networks.</li>
            <li>Run background CRDT synchronizations when LAN connections fail over to cloud.</li>
            <li>Ensure HIPAA-compliant audit trails for every file accessed.</li>
            <li>Provide secure billing, insurance, and M-Pesa integrations.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            Your data is isolated. Each hospital tenant operates in a completely isolated database environment. We use AES-256 encryption at rest and TLS 1.3 for data in transit. Our Sync Engine cryptographically signs offline journals before resolving them to the cloud.
          </p>

          <h2>5. Patient Confidentiality</h2>
          <p>
            We act as a data processor. You (the hospital) are the data controller. We do not sell, rent, or share Patient Health Information with any third-party advertisers or data brokers. Data access is strictly limited to your authorized clinical and administrative personnel based on Role-Based Access Controls (RBAC).
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions about this privacy statement, the practices of this site, or your dealings with this platform, please contact our security team at:
            <br />
            <a href="mailto:privacy@amisigenuine.com">privacy@amisigenuine.com</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 text-center bg-black/20">
        <p className="text-neutral-600 text-sm">© {new Date().getFullYear()} {settings.platformName} Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
