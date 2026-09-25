import { Kafka, Producer, Partitioners } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
  clientId: 'location-tracking-server',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

export const producer: Producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});

export async function connectProducer() {
  try {
    await producer.connect();
    console.log('✅ Kafka Producer connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect Kafka Producer:', error);
    process.exit(1);
  }
}

export async function disconnectProducer() {
  try {
    await producer.disconnect();
    console.log('✅ Kafka Producer disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect Kafka Producer:', error);
  }
}
