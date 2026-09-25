import { Server, Socket } from 'socket.io';
import { redis } from '../config/redis';

export function setupWebSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Client subscribes to the global dashboard room
    socket.on('subscribe_dashboard', async () => {
      socket.join('live-locations');
      console.log(`[Socket] Client ${socket.id} joined live-locations`);
      
      // Optionally, fetch initial known locations from Redis and send them back
      // Since it's a GEO index, fetching all without bounds might be tricky,
      // but in a real app we might fetch recent data.
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
