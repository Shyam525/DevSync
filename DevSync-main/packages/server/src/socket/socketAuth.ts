// import { Socket } from 'socket.io';

// export function socketAuth(socket: Socket, next: (err?: Error) => void) {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     next(new Error('Authentication error'));
//     return;
//   }
//   // Placeholder for socket auth verification
//   next();
// }




import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwtHelpers';

// ─── WHY AUTH HAPPENS HERE, ONCE, NOT PER-EVENT ───────────────────────
//
// A naive approach checks the JWT on every single event the client
// sends (kanban:card:move, chat:message, etc). That means writing the
// same check dozens of times and paying the verification cost on
// every message.
//
// The correct approach: authenticate ONCE, when the socket first
// connects (the "handshake"). If it fails, the connection is refused
// entirely — no events are ever received from an unauthenticated
// client. Everything after a successful handshake is already trusted.
//
// This function is registered with io.use() in Step 9 — Socket.IO
// calls it automatically before 'connection' fires for every client.

export const socketAuth = (
  socket: Socket,
  next: (err?: Error) => void
): void => {
  try {
    // The client sends the token in the `auth` option when connecting
    // (see lib/socketClient.ts, Step 11) — NOT in a header, because
    // WebSocket handshakes don't work like normal HTTP requests.
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      throw new Error('No token provided');
    }

    const payload = verifyAccessToken(token);

    // socket.data is a free-form object for attaching custom data to
    // a connection — this is the Socket.IO equivalent of req.user
    // from Express's authenticate middleware (Week 3).
    socket.data.user = payload;

    next();
  } catch {
    next(new Error('Socket authentication failed'));
  }
};