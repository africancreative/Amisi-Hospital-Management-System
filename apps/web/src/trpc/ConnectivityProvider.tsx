'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { sentinel, ConnectivityState } from '@amisimedos/sync/connectivity/status';

interface ConnectivityContextType {
  state: ConnectivityState;
  baseUrl: string;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export function ConnectivityProvider({
  children,
  edgeUrl,
  cloudUrl = '/api/trpc'
}: {
  children: React.ReactNode;
  edgeUrl: string;
  cloudUrl?: string;
}) {
  const [state, setState] = useState<ConnectivityState>('CLOUD_ONLINE');

  useEffect(() => {
    // 1. Initialize Sentinel
    sentinel.init(edgeUrl, cloudUrl);

    // 2. Subscribe to centralized state changes
    const unsubscribe = sentinel.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
      sentinel.stop();
    };
  }, [edgeUrl, cloudUrl]);

  return (
    <ConnectivityContext.Provider value={{ state, baseUrl: sentinel.getResolvedUrl() }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) throw new Error('useConnectivity must be used within ConnectivityProvider');
  return context;
};
