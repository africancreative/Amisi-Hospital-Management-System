'use client';

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function LocalNodeDashboard() {
  const [localIp, setLocalIp] = useState<string>('Loading...');

  useEffect(() => {
    // Attempt to invoke the Tauri command if running inside Tauri
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      invoke<string>('get_local_ip')
        .then((ip) => setLocalIp(ip))
        .catch((err) => {
          console.error(err);
          setLocalIp('127.0.0.1');
        });
    } else {
      setLocalIp('127.0.0.1');
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4">
          AmisiMedOS Local Node
        </h1>
        <p className="text-xl text-neutral-400">
          This edge node keeps your hospital running even during internet outages.
        </p>

        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 mt-12">
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">
            LAN Access Address
          </h2>
          <div className="flex items-center justify-center gap-4">
            <code className="text-3xl font-mono text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded-2xl">
              http://{localIp}:3000
            </code>
          </div>
          <p className="text-sm text-neutral-500 mt-4">
            Other computers on this network can access the hospital system using the above address.
          </p>
        </div>
      </div>
    </main>
  );
}
