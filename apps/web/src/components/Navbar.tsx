import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getGlobalSettings } from '@/app/actions/system-actions';

export default async function Navbar() {
  const settings = await getGlobalSettings();

  return (
    <nav className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Amisi MedOS Logo"
            className="h-11 w-11 object-contain rounded-xl shadow-lg shadow-blue-600/20"
          />
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            {settings.platformName}
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="/#features" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Features</Link>
        </div>

        {/* CTA only — no system admin link */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/checkout?plan=ESSENTIAL&period=yearly"
              className="hidden md:flex px-5 py-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold text-sm hover:bg-blue-600/20 transition-all items-center gap-2"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              Hospital Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
