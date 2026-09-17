// export const placeholder = () => {};




import { Server as SocketIOServer, Socket } from 'socket.io';
import { kanbanService } from '../services/kanban.service';
import { logger } from '../logger';

interface MoveCardPayload {
  projectId: string;
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  newOrder: number;
}

export const registerKanbanHandlers = (io: SocketIOServer, socket: Socket): void => {
  socket.on('kanban:card:move', async (payload: MoveCardPayload) => {
    try {
      // The EXACT SAME service function from Step 2 — called through
      // a WebSocket event instead of an HTTP route this time.
      const board = await kanbanService.moveCard(payload.projectId, {
        cardId: payload.cardId,
        fromColumnId: payload.fromColumnId,
        toColumnId: payload.toColumnId,
        newOrder: payload.newOrder,
      });

      // Broadcast to EVERYONE in the room, INCLUDING the person who
      // sent the move. Why include the sender? Because their client
      // already applied an OPTIMISTIC (guessed) version of the move.
      // This broadcast carries the server's AUTHORITATIVE version —
      // overwriting the guess with the confirmed truth, even for the
      // person who made the move. This is what keeps every browser
      // tab converged on the exact same state.
      io.to(payload.projectId).emit('kanban:card:moved', { board });
    } catch (error) {
      // Something failed (card not found, bad column, etc). Only tell
      // the ONE socket that sent this — not the whole room — so ONLY
      // their UI rolls back. Everyone else's board was never touched.
      socket.emit('kanban:card:move:error', {
        message: error instanceof Error ? error.message : 'Failed to move card',
        cardId: payload.cardId,
      });
      logger.error({ error, payload }, 'kanban:card:move failed');
    }
  });
};