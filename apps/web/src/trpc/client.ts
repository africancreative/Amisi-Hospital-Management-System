'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/api/root';

/**
 * tRPC Client Hooks for Client Components
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _api = createTRPCReact<AppRouter>() as any;
export const api = _api;
export const trpc = _api;
