import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import { redis } from './config/redis';
import { connectProducer } from './kafka/producer';
import { connectConsumer } from './kafka/consumer';
import { setupWebSockets } from './sockets';

dotenv.config();

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

setupWebSockets(io);

const PORT = process.env.PORT || 4000;

async function start() {
  await redis.connect();
  await connectProducer();
  await connectConsumer(); // Start the background worker
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch(console.error);
