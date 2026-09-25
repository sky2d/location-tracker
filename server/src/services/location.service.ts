import { redis } from '../config/redis';
import { producer } from '../kafka/producer';
import { io } from '../index';

export async function updateLocation(memberId: string, lat: number, lng: number) {
  // 1. Update Redis (Global Dashboard State)
  await redis.geoAdd('live_locations', {
    longitude: Number(lng),
    latitude: Number(lat),
    member: memberId
  });

  // 2. Publish to Kafka for historical persistence
  const messagePayload = { memberId, lat, lng, timestamp: new Date().toISOString() };
  await producer.send({
    topic: 'location-updates',
    messages: [{ value: JSON.stringify(messagePayload) }]
  });

  // 3. Broadcast real-time update to all dashboard clients
  io.to('live-locations').emit('location_update', { memberId, lat, lng });
}
