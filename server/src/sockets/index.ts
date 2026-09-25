import { Server, Socket } from 'socket.io';
import { redis } from '../config/redis';
import { updateLocation } from '../services/location.service';

export function setupWebSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Client subscribes to the global dashboard room
    socket.on('subscribe_dashboard', async () => {
      socket.join('live-locations');
      console.log(`[Socket] Client ${socket.id} joined live-locations`);
    });

    // Client sends their live location
    socket.on('send_location', async (data: { memberId: string, lat: number, lng: number }) => {
      try {
        await updateLocation(data.memberId, data.lat, data.lng);
      } catch (error) {
        console.error('Error updating location via websocket', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
