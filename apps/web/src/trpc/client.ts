'use client';

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/api/root';

/**
 * tRPC Client Hooks for Client Components
 */
export const api = createTRPCReact<AppRouter>({});
export const trpc = api;
