'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// ─── Types ───────────────────────────────────────────────────────────────

export interface RealtimeEvent {
  type: string;
  resource?: string;
  id?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface RealtimeState {
  isConnected: boolean;
  isConnecting: boolean;
  lastEvent: RealtimeEvent | null;
  connectionError: string | null;
}

interface SocketContextValue {
  socket: Socket | null;
  state: RealtimeState;
  subscribe: (channel: string, resource?: string, resourceId?: string) => void;
  unsubscribe: (channel: string, resource?: string, resourceId?: string) => void;
  emit: (event: string, data?: Record<string, unknown>) => void;
  onEvent: (type: string, handler: (event: RealtimeEvent) => void) => () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────

const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocketContext(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within RealtimeProvider');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────

interface RealtimeProviderProps {
  children: ReactNode;
  tenantId: string;
  userId?: string;
  roles?: string[];
  department?: string;
  enabled?: boolean;
}

export function RealtimeProvider({ children, tenantId, userId, roles, department, enabled = true }: RealtimeProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Map<string, Set<(event: RealtimeEvent) => void>>>(new Map());
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isConnecting: false,
    lastEvent: null,
    connectionError: null,
  });

  useEffect(() => {
    if (!enabled || !tenantId) return;

    setState(prev => ({ ...prev, isConnecting: true }));

    const socket = io({
      transports: ['websocket', 'polling'],
      auth: { userId, tenantId, roles, department },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[RealtimeProvider] Connected to WebSocket');
      setState(prev => ({ ...prev, isConnected: true, isConnecting: false, connectionError: null }));
    });

    socket.on('disconnect', (reason) => {
      console.log(`[RealtimeProvider] Disconnected: ${reason}`);
      setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
    });

    socket.on('connect_error', (err) => {
      console.error('[RealtimeProvider] Connection error:', err.message);
      setState(prev => ({ ...prev, isConnected: false, isConnecting: false, connectionError: err.message }));
    });

    // Server-wide events (all channels)
    socket.on('server:event', (event: RealtimeEvent) => {
      dispatchEvent(event);
    });

    // Channel-specific events
    socket.on('channel:event', (event: RealtimeEvent & { channel: string }) => {
      dispatchEvent(event);
    });

    // Resource-specific events
    socket.on('resource:event', (event: RealtimeEvent & { channel: string }) => {
      dispatchEvent(event);
    });

    // Auto-subscribe to tenant-wide channels
    socket.on('connect', () => {
      ['queue', 'billing', 'clinical', 'inventory', 'lab', 'pharmacy', 'adt', 'chat'].forEach(channel => {
        socket.emit('subscribe:channel', { channel });
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tenantId, userId, roles, department, enabled]);

  const dispatchEvent = useCallback((event: RealtimeEvent) => {
    setState(prev => ({ ...prev, lastEvent: event }));

    const handlers = handlersRef.current.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[RealtimeProvider] Handler error for ${event.type}:`, err);
        }
      });
    }

    // Wildcard handlers
    const wildcardHandlers = handlersRef.current.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (err) {
          console.error('[RealtimeProvider] Wildcard handler error:', err);
        }
      });
    }
  }, []);

  const subscribe = useCallback((channel: string, resource?: string, resourceId?: string) => {
    socketRef.current?.emit('subscribe:channel', { channel, resource, resourceId });
  }, []);

  const unsubscribe = useCallback((channel: string, resource?: string, resourceId?: string) => {
    socketRef.current?.emit('unsubscribe:channel', { channel, resource, resourceId });
  }, []);

  const emit = useCallback((event: string, data?: Record<string, unknown>) => {
    socketRef.current?.emit(event, data);
  }, []);

  const onEvent = useCallback((type: string, handler: (event: RealtimeEvent) => void): (() => void) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);
    return () => {
      handlersRef.current.get(type)?.delete(handler);
    };
  }, []);

  const value: SocketContextValue = {
    socket: socketRef.current,
    state,
    subscribe,
    unsubscribe,
    emit,
    onEvent,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
