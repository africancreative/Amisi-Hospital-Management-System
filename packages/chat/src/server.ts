import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export type ChatEventType = 
  | 'MESSAGE_SENT'
  | 'MESSAGE_DELIVERED'
  | 'MESSAGE_READ'
  | 'MESSAGE_EDITED'
  | 'MESSAGE_DELETED'
  | 'TYPING_START'
  | 'TYPING_STOP'
  | 'USER_ONLINE'
  | 'USER_OFFLINE'
  | 'GROUP_CREATED'
  | 'GROUP_UPDATED'
  | 'GROUP_MEMBER_JOINED'
  | 'GROUP_MEMBER_LEFT'
  | 'GROUP_MEMBER_REMOVED';

export interface ChatPayload {
  messageId?: string;
  groupId?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  messageType?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ChatEvent {
  type: ChatEventType;
  payload: ChatPayload;
  tenantId: string;
  timestamp: string;
}

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  roles: string[];
}

class ChatServer extends EventEmitter {
  private static instance: ChatServer;
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): ChatServer {
    if (!ChatServer.instance) {
      ChatServer.instance = new ChatServer();
    }
    return ChatServer.instance;
  }

  public initialize(httpServer: HttpServer): SocketIOServer {
    if (this.io) return this.io;

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('[ChatServer] WebSocket server initialized');
    return this.io;
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use((socket: Socket, next: (err?: Error) => void) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      const tenantId = socket.handshake.headers['x-tenant-id'] as string;
      
      if (!tenantId) {
        return next(new Error('Tenant ID required'));
      }

      (socket as any).user = {
        userId: socket.id,
        tenantId,
        roles: []
      };
      next();
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as AuthenticatedUser;
      console.log(`[ChatServer] User connected: ${user.userId} (Tenant: ${user.tenantId})`);

      this.registerUser(user.userId, socket.id);
      this.joinUserToRooms(socket, user);

      socket.on('send_message', (data: { receiverId?: string; groupId?: string; content: string; messageType?: string }) => {
        this.handleSendMessage(socket, user, data);
      });

      socket.on('send_group_message', (data: { groupId: string; content: string; messageType?: string }) => {
        this.handleSendGroupMessage(socket, user, data);
      });

      socket.on('mark_read', (data: { messageId?: string; groupId?: string }) => {
        this.handleMarkRead(socket, user, data);
      });

      socket.on('typing_start', (data: { receiverId?: string; groupId?: string }) => {
        this.handleTypingStart(socket, user, data);
      });

      socket.on('typing_stop', (data: { receiverId?: string; groupId?: string }) => {
        this.handleTypingStop(socket, user, data);
      });

      socket.on('join_group', (data: { groupId: string }) => {
        socket.join(`group:${data.groupId}`);
      });

      socket.on('leave_group', (data: { groupId: string }) => {
        socket.leave(`group:${data.groupId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[ChatServer] User disconnected: ${user.userId}`);
        this.unregisterUser(user.userId, socket.id);
        this.broadcastUserStatus(user.tenantId, user.userId, 'offline');
      });
    });
  }

  private registerUser(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    this.socketUsers.set(socketId, userId);
  }

  private unregisterUser(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketUsers.delete(socketId);
  }

  private joinUserToRooms(socket: Socket, user: AuthenticatedUser): void {
    socket.join(`tenant:${user.tenantId}`);
    socket.join(`user:${user.userId}`);
    this.broadcastUserStatus(user.tenantId, user.userId, 'online');
  }

  private handleSendMessage(socket: Socket, user: AuthenticatedUser, data: { receiverId?: string; groupId?: string; content: string; messageType?: string }): void {
    if (!this.io) return;

    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    const event: ChatEvent = {
      type: 'MESSAGE_SENT',
      payload: {
        messageId,
        senderId: user.userId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType || 'TEXT',
        timestamp
      },
      tenantId: user.tenantId,
      timestamp
    };

    const payload = {
      id: messageId,
      content: data.content,
      messageType: data.messageType || 'TEXT',
      senderId: user.userId,
      receiverId: data.receiverId,
      timestamp,
      read: false
    };

    socket.emit('message_sent', payload);
    if (data.receiverId) {
      socket.to(`user:${data.receiverId}`).emit('new_message', payload);
    }

    this.emit('message', event);
    console.log(`[ChatServer] Message sent from ${user.userId} to ${data.receiverId}`);
  }

  private handleSendGroupMessage(socket: Socket, user: AuthenticatedUser, data: { groupId: string; content: string; messageType?: string }): void {
    if (!this.io) return;

    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    const event: ChatEvent = {
      type: 'MESSAGE_SENT',
      payload: {
        messageId,
        groupId: data.groupId,
        senderId: user.userId,
        content: data.content,
        messageType: data.messageType || 'TEXT',
        timestamp
      },
      tenantId: user.tenantId,
      timestamp
    };

    const payload = {
      id: messageId,
      content: data.content,
      messageType: data.messageType || 'TEXT',
      senderId: user.userId,
      groupId: data.groupId,
      timestamp
    };

    socket.emit('message_sent', payload);
    socket.to(`group:${data.groupId}`).emit('new_group_message', payload);

    this.emit('message', event);
    console.log(`[ChatServer] Group message sent in ${data.groupId} by ${user.userId}`);
  }

  private handleMarkRead(socket: Socket, user: AuthenticatedUser, data: { messageId?: string; groupId?: string }): void {
    if (!this.io) return;

    if (data.messageId) {
      socket.to(`user:${user.userId}`).emit('message_read', {
        messageId: data.messageId,
        readerId: user.userId,
        readAt: new Date().toISOString()
      });
    }

    if (data.groupId) {
      socket.to(`group:${data.groupId}`).emit('group_message_read', {
        groupId: data.groupId,
        userId: user.userId,
        readAt: new Date().toISOString()
      });
    }
  }

  private handleTypingStart(socket: Socket, user: AuthenticatedUser, data: { receiverId?: string; groupId?: string }): void {
    if (data.receiverId) {
      socket.to(`user:${data.receiverId}`).emit('user_typing', {
        userId: user.userId,
        isTyping: true
      });
    }

    if (data.groupId) {
      socket.to(`group:${data.groupId}`).emit('group_member_typing', {
        groupId: data.groupId,
        userId: user.userId,
        isTyping: true
      });
    }
  }

  private handleTypingStop(socket: Socket, user: AuthenticatedUser, data: { receiverId?: string; groupId?: string }): void {
    if (data.receiverId) {
      socket.to(`user:${data.receiverId}`).emit('user_typing', {
        userId: user.userId,
        isTyping: false
      });
    }

    if (data.groupId) {
      socket.to(`group:${data.groupId}`).emit('group_member_typing', {
        groupId: data.groupId,
        userId: user.userId,
        isTyping: false
      });
    }
  }

  private broadcastUserStatus(tenantId: string, userId: string, status: 'online' | 'offline'): void {
    if (!this.io) return;

    this.io.to(`tenant:${tenantId}`).emit('user_status', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  public sendToUser(tenantId: string, userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`tenant:${tenantId}`).to(`user:${userId}`).emit(event, data);
  }

  public sendToGroup(tenantId: string, groupId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`tenant:${tenantId}`).to(`group:${groupId}`).emit(event, data);
  }

  public broadcastToTenant(tenantId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`tenant:${tenantId}`).emit(event, data);
  }

  public getOnlineUsers(tenantId: string): string[] {
    if (!this.io) return [];
    const sockets = this.io.sockets.adapter.rooms.get(`tenant:${tenantId}`);
    if (!sockets) return [];
    const socketArray = Array.from(sockets);
    const onlineUsers: string[] = [];
    for (const socketId of socketArray) {
      const userId = this.socketUsers.get(socketId as string);
      if (userId) onlineUsers.push(userId);
    }
    return onlineUsers;
  }

  public getSocketServer(): SocketIOServer | null {
    return this.io;
  }
}

export const chatServer = ChatServer.getInstance();