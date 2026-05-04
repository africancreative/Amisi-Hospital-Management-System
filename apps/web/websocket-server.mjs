import { Server as SocketIOServer } from 'socket.io';
import { realtimeHub, realtimeGateway } from '@amisimedos/chat';

let io = null;

export function attachWebSocketServer(httpServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // Middleware: extract auth from handshake
  io.use((socket, next) => {
    const { userId, tenantId, roles, department } = socket.handshake.auth;
    if (!tenantId) return next(new Error('Tenant ID required'));
    socket.data.user = {
      userId: userId ?? socket.id,
      tenantId,
      roles: roles ?? [],
      department,
    };
    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`[WebSocket] Connected: ${user.userId} (Tenant: ${user.tenantId})`);

    socket.join(`tenant:${user.tenantId}`);
    socket.join(`user:${user.userId}`);
    if (user.department) socket.join(`dept:${user.tenantId}:${user.department}`);

    socket.on('subscribe:channel', (data) => {
      const room = buildRoom(user.tenantId, data.channel, data.resource, data.resourceId);
      socket.join(room);
    });

    socket.on('unsubscribe:channel', (data) => {
      const room = buildRoom(user.tenantId, data.channel, data.resource, data.resourceId);
      socket.leave(room);
    });

    socket.on('client:event', (data) => {
      realtimeGateway.publish({
        tenantId: user.tenantId,
        type: data.type,
        resource: 'client',
        id: socket.id,
        payload: data.payload,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Disconnected: ${user.userId}`);
    });
  });

  // Bridge: realtimeHub → Socket.io
  const originalEmit = realtimeHub.emit.bind(realtimeHub);
  realtimeHub.emit = function (event, ...args) {
    if (event.startsWith('event:') && args[0]?.tenantId) {
      const { tenantId, type, resource, id, payload, timestamp } = args[0];
      io.to(`tenant:${tenantId}`).emit('server:event', { type, resource, id, payload, timestamp });

      const channel = determineChannel(type);
      io.to(`channel:${tenantId}:${channel}`).emit('channel:event', { channel, type, resource, id, payload, timestamp });

      if (resource) {
        io.to(`channel:${tenantId}:${channel}:${resource}:${id}`).emit('resource:event', {
          channel, type, resource, id, payload, timestamp,
        });
      }
    }
    return originalEmit(event, ...args);
  };

  console.log('[WebSocket] Server attached');
  return io;
}

function buildRoom(tenantId, channel, resource, resourceId) {
  let room = `channel:${tenantId}:${channel}`;
  if (resource) room += `:${resource}`;
  if (resourceId) room += `:${resourceId}`;
  return room;
}

function determineChannel(type) {
  const map = {
    QUEUE: 'queue', CHAT: 'chat', MESSAGE: 'chat', TYPING: 'chat',
    BILL: 'billing', PAYMENT: 'billing',
    INVENTORY: 'inventory', STOCK: 'inventory',
    LAB: 'lab', PRESCRIPTION: 'pharmacy',
    PATIENT_ADMITTED: 'adt', PATIENT_TRANSFERRED: 'adt', PATIENT_DISCHARGED: 'adt',
    VITALS: 'clinical', PATIENT_MUTATED: 'clinical', CONSULTATION: 'clinical',
    SYNC: 'system',
  };
  for (const [prefix, channel] of Object.entries(map)) {
    if (type.includes(prefix)) return channel;
  }
  return 'events';
}

export function getSocketServer() {
  return io;
}
