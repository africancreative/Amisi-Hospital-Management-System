'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';

interface BillingStatusProps {
  isExpired: boolean;
  isLockout: boolean;
  isWithinGrace: boolean;
  gracePeriodRemaining: number;
  planCode: string;
}

/**
 * Billing Resilience Widget
 * 
 * Displays the current subscription tier and manages the 72-hour 
 * clinical grace period countdown for offline or expired nodes.
 */
export function BillingResilienceWidget({ 
  isExpired, 
  isLockout,
  isWithinGrace, 
  gracePeriodRemaining, 
  planCode 
}: BillingStatusProps) {
  const [timeLeft, setTimeLeft] = useState(gracePeriodRemaining);

  useEffect(() => {
    if (isWithinGrace) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isWithinGrace]);

  const formatCountdown = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (!isExpired) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{planCode} Plan</span>
          <span className="text-[9px] text-emerald-500/70 uppercase">Subscription Active</span>
        </div>
      </div>
    );
  }

  if (isWithinGrace) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-amber-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative flex flex-col gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Clinical Grace Period</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-mono font-black text-amber-400">
              {formatCountdown(timeLeft)}
            </span>
            <span className="text-[8px] text-amber-500/60 uppercase leading-none mt-1">
              Lockout Pending: Connect for Renewal
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
      <ShieldAlert className="h-4 w-4 text-red-500" />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-red-500 uppercase">System Locked</span>
        <span className="text-[9px] text-red-500/70">Subscription Re-verification Required</span>
      </div>
    </div>
  );
}
