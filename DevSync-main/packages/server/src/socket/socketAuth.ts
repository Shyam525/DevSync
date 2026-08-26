import { Socket } from 'socket.io';

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token;
  if (!token) {
    next(new Error('Authentication error'));
    return;
  }
  // Placeholder for socket auth verification
  next();
}
