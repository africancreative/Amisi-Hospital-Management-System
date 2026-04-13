import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { isReachable, ConnectivityState } from '@amisimedos/sync/connectivity/status';

interface ConnectivityContextType {
  state: ConnectivityState;
  baseUrl: string;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export function ConnectivityProvider({
  children,
  edgeUrl,
  cloudUrl = 'https://amisigenuine.com/api/trpc'
}: {
  children: React.ReactNode;
  edgeUrl: string;
  cloudUrl?: string;
}) {
  const [state, setState] = useState<ConnectivityState>('CLOUD_ONLINE');
  const [baseUrl, setBaseUrl] = useState(cloudUrl);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const netState = await Network.getNetworkStateAsync();
        
        if (!netState.isConnected) {
          setState('OFFLINE');
          return;
        }

        // Try Edge first if we have a URL
        if (edgeUrl) {
          const edgeAlive = await isReachable(`${edgeUrl}/api/health`);
          if (edgeAlive) {
            setState('EDGE_ONLINE');
            setBaseUrl(edgeUrl);
            return;
          }
        }

        // Fallback or explicit Cloud
        setState('CLOUD_ONLINE');
        setBaseUrl(cloudUrl);
      } catch (err) {
        setState('OFFLINE');
      }
    };

    checkStatus();
    
    // Listen for network changes
    const subscription = Network.addNetworkStateListener(state => {
      checkStatus();
    });

    const interval = setInterval(checkStatus, 30000); // Less frequent polling when listener is active

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [edgeUrl, cloudUrl]);


  return (
    <ConnectivityContext.Provider value={{ state, baseUrl }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) throw new Error('useConnectivity must be used within ConnectivityProvider');
  return context;
};
