'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useMemo, useState } from 'react';
import { api } from './client';
import { ConnectivityProvider, useConnectivity } from './ConnectivityProvider';

/**
 * Dynamic tRPC Client Wrapper
 * Re-initializes the client whenever the Connectivity base URL changes.
 */
import { hybridLink } from './hybrid-link';

/**
 * Global tRPC Provider
 * Uses the HybridLink for intelligent routing (Edge vs Cloud failover).
 */
function DynamicTrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  const trpcClient = useMemo(() =>
    api.createClient({
      links: [
        hybridLink,
      ],
    }),
    []
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children as any}
      </QueryClientProvider>
    </api.Provider>
  );
}

/**
 * Global tRPC & Connectivity Root
 */
export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const edgeUrl = 'http://localhost:5000';

  return (
    <ConnectivityProvider edgeUrl={edgeUrl}>
      <DynamicTrpcProvider>
        {children as any}
      </DynamicTrpcProvider>
    </ConnectivityProvider>
  );
}
