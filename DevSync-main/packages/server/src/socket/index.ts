// export const placeholder = () => {};




import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { socketAuth } from './socketAuth';
import { registerKanbanHandlers } from './kanbanHandler';
import { logger } from '../logger';
import { env } from '../config/env';

export const initSocket = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,   // same origin restriction as Express's cors() from Week 4
    },
  });

  // Runs for EVERY connection attempt, before 'connection' fires below.
  io.use(socketAuth);

  io.on('connection', (socket) => {
    logger.info(
      { userId: socket.data.user?.userId, socketId: socket.id },
      'Socket connected'
    );

    // A client must explicitly join a project's room before receiving
    // that project's events. Rooms isolate broadcasts — without this,
    // moving a card in Project A would broadcast to EVERY connected
    // client across the entire app, including people looking at
    // completely unrelated projects.
    socket.on('room:join', ({ projectId }: { projectId: string }) => {
      socket.join(projectId);
      logger.info({ userId: socket.data.user?.userId, projectId }, 'Joined room');
    });

    socket.on('room:leave', ({ projectId }: { projectId: string }) => {
      socket.leave(projectId);
    });

    registerKanbanHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info(
        { userId: socket.data.user?.userId, socketId: socket.id },
        'Socket disconnected'
      );
    });
  });

  return io;
};