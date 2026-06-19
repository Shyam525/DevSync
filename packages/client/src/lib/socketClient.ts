import { io } from 'socket.io-client';

export const socketClient = io(import.meta.env.VITE_SOCKET_URL || '/');
