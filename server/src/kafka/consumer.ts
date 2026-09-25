import { Kafka, Consumer } from 'kafkajs';
import { prisma } from '../config/db';

const kafka = new Kafka({
  clientId: 'location-tracking-consumer',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

export const consumer: Consumer = kafka.consumer({ groupId: 'location-history-group' });

const buffer: any[] = [];
const BATCH_SIZE = 50;
const BATCH_TIME_MS = 5000;
let flushTimer: NodeJS.Timeout | null = null;

async function flushBuffer() {
  if (buffer.length === 0) return;

  const batch = [...buffer];
  buffer.length = 0; // Clear the buffer

  try {
    await prisma.locationHistory.createMany({
      data: batch.map((item) => ({
        userId: item.memberId,
        lat: Number(item.lat),
        lng: Number(item.lng),
        timestamp: new Date(item.timestamp),
      })),
      skipDuplicates: true,
    });
    console.log(`✅ Flushed ${batch.length} location updates to PostgreSQL`);
  } catch (error) {
    console.error('❌ Failed to batch insert locations:', error);
    // Ideally, put back into buffer or dead-letter queue, but for now just log it.
  }
}

export async function connectConsumer() {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes('location-updates')) {
      await admin.createTopics({
        topics: [{ topic: 'location-updates' }],
      });
      console.log('✅ Created topic "location-updates"');
    }
    await admin.disconnect();

    await consumer.connect();
    console.log('✅ Kafka Consumer connected successfully');

    await consumer.subscribe({ topic: 'location-updates', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        try {
          const payload = JSON.parse(message.value.toString());
          buffer.push(payload);

          if (buffer.length >= BATCH_SIZE) {
            await flushBuffer();
            if (flushTimer) clearTimeout(flushTimer);
            flushTimer = setTimeout(flushBuffer, BATCH_TIME_MS);
          }
        } catch (err) {
          console.error('Failed to parse location message', err);
        }
      },
    });

    // Ensure we flush on a time interval as well, in case we don't hit the BATCH_SIZE
    flushTimer = setTimeout(flushBuffer, BATCH_TIME_MS);

  } catch (error) {
    console.error('❌ Failed to start Kafka Consumer:', error);
    process.exit(1);
  }
}
