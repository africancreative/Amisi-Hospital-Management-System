'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Server, WifiOff, Activity, ShieldCheck } from 'lucide-react';
import { useConnectivity } from '@/trpc/ConnectivityProvider';

export default function ConnectionStatus() {
  const { state } = useConnectivity();
  const [isVisible, setIsVisible] = useState(false);
  const [lastState, setLastState] = useState(state);

  useEffect(() => {
    // Show the indicator briefly when state changes
    if (state !== lastState) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      setLastState(state);
      return () => clearTimeout(timer);
    }
  }, [state, lastState]);

  const config = {
    EDGE_ONLINE: {
      icon: <Server className="w-4 h-4" />,
      text: 'Connected to Local Edge',
      subtext: 'Optimal LAN Performance',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    CLOUD_ONLINE: {
      icon: <Cloud className="w-4 h-4" />,
      text: 'Connected to Cloud',
      subtext: 'Global Hub Active',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    OFFLINE: {
      icon: <WifiOff className="w-4 h-4" />,
      text: 'System Offline',
      subtext: 'Reconnecting...',
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    }
  };

  const current = config[state] || config.OFFLINE;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`flex items-center gap-4 p-4 rounded-2xl border ${current.bg} ${current.border} backdrop-blur-xl shadow-2xl shadow-black/20 min-w-[280px]`}
          >
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full ${current.bg}`}>
              <div className={`${current.textColor}`}>
                {current.icon}
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 rounded-full ${current.bg} -z-10`}
              />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white/90 leading-tight">
                {current.text}
              </h4>
              <p className="text-[11px] font-medium opacity-60 uppercase tracking-wider mt-0.5">
                {current.subtext}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 pl-4 border-l border-white/10">
               <Activity className="w-3 h-3 opacity-40" />
               <span className="text-[10px] font-bold opacity-40 tracking-tighter">MS</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Trigger Dot */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg cursor-pointer ${isVisible ? 'bg-white/10' : 'bg-black/40'}`}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${current.color} shadow-[0_0_12px_rgba(0,0,0,0.5)] relative`}>
            <motion.div 
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-full ${current.color}`}
            />
        </div>
      </motion.button>
    </div>
  );
}
