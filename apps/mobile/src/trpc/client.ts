import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../apps/web/src/server/api/root';

export const api = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  /**
   * AmisiMedOS Multi-Environment Resolver
   */
  if (__DEV__) {
    // 1. Android Emulator
    if (require('react-native').Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    // 2. iOS Simulator & Web
    return 'http://localhost:3000';
  }
  
  // 3. Cloud Production Hub
  return 'https://api.amisigenuine.com'; 
};
