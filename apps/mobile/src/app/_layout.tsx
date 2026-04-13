import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useMemo, useState } from 'react';
import { api, getBaseUrl } from '../trpc/client';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/Colors';
import { View } from 'react-native';
import { ConnectivityProvider, useConnectivity } from '../trpc/ConnectivityProvider';
import { SyncManager } from '../components/SyncManager';

/**
 * Dynamic tRPC Client Wrapper for Mobile
 */
function DynamicTrpcProvider({ children }: { children: React.ReactNode }) {
  const { baseUrl } = useConnectivity();
  const [queryClient] = useState(() => new QueryClient());
  
  const trpcClient = useMemo(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: baseUrl.endsWith('/api/trpc') ? baseUrl : `${baseUrl}/api/trpc`,
        }),
      ],
    }),
    [baseUrl]
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  );
}

export default function RootLayout() {
  const edgeUrl = getBaseUrl(); // Initial discovery URL

  return (
    <ConnectivityProvider edgeUrl={edgeUrl}>
      <DynamicTrpcProvider>
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <SyncManager />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.background,
              },
              headerTintColor: Colors.secondary,
              headerTitleStyle: {
                fontWeight: 'bold',
                color: Colors.text,
              },
              contentStyle: {
                backgroundColor: Colors.background,
              },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: 'AmisiMedOS',
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </View>
      </DynamicTrpcProvider>
    </ConnectivityProvider>
  );
}
