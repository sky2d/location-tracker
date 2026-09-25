import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface LocationData {
  memberId: string;
  lat: number;
  lng: number;
}

export function useLiveLocations(serverUrl: string = 'http://localhost:4000') {
  const [locations, setLocations] = useState<Record<string, LocationData>>({});

  useEffect(() => {
    // 1. Connect to the WebSocket server
    const socket: Socket = io(serverUrl);

    socket.on('connect', () => {
      console.log('Connected to WebSocket server:', socket.id);
      // 2. Subscribe to the dashboard room
      socket.emit('subscribe_dashboard');
    });

    // 3. Listen for real-time updates
    socket.on('location_update', (data: LocationData) => {
      setLocations((prev) => ({
        ...prev,
        [data.memberId]: data, // Update or add the new location for this member
      }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  // Convert the dictionary to an array for easier mapping in the UI
  return Object.values(locations);
}
