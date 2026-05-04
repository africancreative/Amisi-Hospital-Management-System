'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocketContext, RealtimeEvent } from './realtime-provider';

// ─── Queue Updates ───────────────────────────────────────────────────────

export interface QueueUpdate {
  patientId: string;
  patientName: string;
  department: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  position?: number;
  estimatedWait?: number;
  assignedDoctor?: string;
  timestamp: string;
}

export function useQueueUpdates(department?: string) {
  const { onEvent, state } = useSocketContext();
  const [queueUpdates, setQueueUpdates] = useState<QueueUpdate[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const updateRef = useRef<((update: QueueUpdate) => void) | undefined>(undefined);

  useEffect(() => {
    return onEvent('QUEUE_UPDATED', (event: RealtimeEvent) => {
      if (event.payload) {
        const update: QueueUpdate = {
          patientId: event.payload.patientId as string,
          patientName: event.payload.patientName as string,
          department: event.payload.department as string,
          status: event.payload.status as QueueUpdate['status'],
          position: event.payload.position as number | undefined,
          estimatedWait: event.payload.estimatedWait as number | undefined,
          assignedDoctor: event.payload.assignedDoctor as string | undefined,
          timestamp: event.timestamp,
        };

        if (department && update.department !== department) return;

        setQueueUpdates(prev => [update, ...prev].slice(0, 100));
        updateRef.current?.(update);
      }
    });
  }, [onEvent, department]);

  useEffect(() => {
    return onEvent('QUEUE_PATIENT_ADDED', () => {
      setQueueCount(prev => prev + 1);
    });
  }, [onEvent]);

  useEffect(() => {
    return onEvent('QUEUE_PATIENT_REMOVED', () => {
      setQueueCount(prev => Math.max(0, prev - 1));
    });
  }, [onEvent]);

  return {
    isConnected: state.isConnected,
    queueUpdates,
    queueCount,
    setQueueCount,
    onQueueUpdate: (cb: (update: QueueUpdate) => void) => { updateRef.current = cb; },
    clearUpdates: () => setQueueUpdates([]),
  };
}

// ─── Billing Updates ─────────────────────────────────────────────────────

export interface BillingUpdate {
  invoiceId?: string;
  patientId: string;
  patientName?: string;
  amount?: number;
  status?: 'pending' | 'partial' | 'paid' | 'cancelled';
  paymentMethod?: string;
  timestamp: string;
}

export function useBillingUpdates(patientId?: string) {
  const { onEvent, state } = useSocketContext();
  const [billingUpdates, setBillingUpdates] = useState<BillingUpdate[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const updateRef = useRef<((update: BillingUpdate) => void) | undefined>(undefined);

  useEffect(() => {
    const unsubscribePaid = onEvent('PAYMENT_RECEIVED', (event: RealtimeEvent) => {
      if (event.payload) {
        const update: BillingUpdate = {
          invoiceId: event.payload.invoiceId as string | undefined,
          patientId: event.payload.patientId as string,
          patientName: event.payload.patientName as string | undefined,
          amount: event.payload.amount as number | undefined,
          status: 'paid',
          paymentMethod: event.payload.paymentMethod as string | undefined,
          timestamp: event.timestamp,
        };

        if (patientId && update.patientId !== patientId) return;

        setBillingUpdates(prev => [update, ...prev].slice(0, 100));
        setTotalRevenue(prev => prev + (update.amount ?? 0));
        updateRef.current?.(update);
      }
    });

    const unsubscribeGenerated = onEvent('BILL_GENERATED', (event: RealtimeEvent) => {
      if (event.payload) {
        const update: BillingUpdate = {
          invoiceId: event.payload.invoiceId as string | undefined,
          patientId: event.payload.patientId as string,
          patientName: event.payload.patientName as string | undefined,
          amount: event.payload.totalAmount as number | undefined,
          status: 'pending',
          timestamp: event.timestamp,
        };

        if (patientId && update.patientId !== patientId) return;

        setBillingUpdates(prev => [update, ...prev].slice(0, 100));
        updateRef.current?.(update);
      }
    });

    return () => {
      unsubscribePaid();
      unsubscribeGenerated();
    };
  }, [onEvent, patientId]);

  return {
    isConnected: state.isConnected,
    billingUpdates,
    totalRevenue,
    onBillingUpdate: (cb: (update: BillingUpdate) => void) => { updateRef.current = cb; },
    clearUpdates: () => setBillingUpdates([]),
  };
}

// ─── Chat Updates ────────────────────────────────────────────────────────

export interface ChatUpdate {
  messageId: string;
  senderId: string;
  senderName?: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  messageType: string;
  timestamp: string;
  read: boolean;
}

export function useChatUpdates(userId?: string, groupId?: string) {
  const { onEvent, state } = useSocketContext();
  const [newMessages, setNewMessages] = useState<ChatUpdate[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messageRef = useRef<((msg: ChatUpdate) => void) | undefined>(undefined);

  useEffect(() => {
    return onEvent('MESSAGE_SENT', (event: RealtimeEvent) => {
      if (event.payload) {
        const msg: ChatUpdate = {
          messageId: event.payload.messageId as string,
          senderId: event.payload.senderId as string,
          senderName: event.payload.senderName as string | undefined,
          receiverId: event.payload.receiverId as string | undefined,
          groupId: event.payload.groupId as string | undefined,
          content: event.payload.content as string,
          messageType: event.payload.messageType as string ?? 'TEXT',
          timestamp: event.timestamp,
          read: false,
        };

        // Filter: show messages where I'm the receiver, or in my group, or I sent
        if (userId && msg.senderId !== userId && msg.receiverId !== userId && msg.groupId !== groupId) return;

        setNewMessages(prev => [msg, ...prev].slice(0, 200));
        if (msg.senderId !== userId) setUnreadCount(prev => prev + 1);
        messageRef.current?.(msg);
      }
    });
  }, [onEvent, userId, groupId]);

  useEffect(() => {
    return onEvent('MESSAGE_READ', () => {
      setUnreadCount(0);
    });
  }, [onEvent]);

  useEffect(() => {
    const startSub = onEvent('TYPING_START', (event: RealtimeEvent) => {
      const p = event.payload;
      if (p && p.userId) {
        setTypingUsers(prev => new Set(prev).add(p.userId as string));
      }
    });
    const stopSub = onEvent('TYPING_STOP', (event: RealtimeEvent) => {
      const p = event.payload;
      if (p && p.userId) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(p.userId as string);
          return next;
        });
      }
    });
    return () => { startSub(); stopSub(); };
  }, [onEvent]);

  return {
    isConnected: state.isConnected,
    newMessages,
    unreadCount,
    typingUsers,
    clearUnread: () => setUnreadCount(0),
    onNewMessage: (cb: (msg: ChatUpdate) => void) => { messageRef.current = cb; },
    clearMessages: () => setNewMessages([]),
  };
}

// ─── Generic Channel Hook ────────────────────────────────────────────────

export function useChannelEvents(channel: string, resource?: string, resourceId?: string) {
  const { onEvent, subscribe, unsubscribe, state } = useSocketContext();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  useEffect(() => {
    subscribe(channel, resource, resourceId);
    return () => { unsubscribe(channel, resource, resourceId); };
  }, [channel, resource, resourceId, subscribe, unsubscribe]);

  useEffect(() => {
    return onEvent('*', (event: RealtimeEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 500));
    });
  }, [onEvent]);

  return {
    isConnected: state.isConnected,
    events,
    clearEvents: () => setEvents([]),
  };
}
