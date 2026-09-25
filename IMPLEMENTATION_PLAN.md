# Comprehensive Implementation Plan

This document breaks down the high-level tasks in `TODO.md` into detailed, step-by-step implementation plans for each phase. This acts as the technical playbook for building out the Real-Time Location Tracking System.

---

## Phase 1: Foundation & Setup
**Goal**: Lay down the core plumbing of the monorepo, create shared utilities, define the database schema, and get all Node.js projects to a state where they can start up.

### 1. Monorepo & TypeScript Foundation
- **Workspaces**: Configure the root `package.json` to use npm workspaces for `apps/*`, `services/*`, and `packages/*`.
- **Global Tooling**: Install global development dependencies (TypeScript, ESLint, Prettier, `ts-node`, `nodemon`).
- **Base Config**: Create a root `tsconfig.json` with strict type checking (`strict: true`, `target: ES2022`). All sub-packages will extend this config.

### 2. Building Shared Packages
- **`packages/logger`**:
  - Install `pino` and `pino-pretty`.
  - Export a configured logger instance that formats logs cleanly in development and outputs structured JSON in production.
- **`packages/config`**:
  - Install `zod` and `dotenv`.
  - Create strict validation schemas for environment variables (`DATABASE_URL`, `KAFKA_BROKERS`, `PORT`, `REDIS_URL`).
  - Export the typed configuration object to fail fast if variables are missing.
- **`packages/database`**:
  - Initialize Prisma (`npx prisma init`).
  - Define core entities in `schema.prisma`: `User`, `Driver`, `Ride`, and `LocationHistory`.
  - Generate the Prisma Client to be imported by the API and consumers.

### 3. Application & Service Scaffolding
- **Consumers (`services/*`)**:
  - Initialize Node.js projects in `location-consumer`, `location-persistence`, and `analytics-consumer`.
  - Set up `src/index.ts` and wire them to import `@tracking/logger` and `@tracking/config`.
- **API Gateway (`apps/api`)**:
  - Initialize Express with CORS and Helmet.
  - Create a basic server listening on the configured `PORT` with a `GET /health` endpoint.
- **Web App (`apps/web`)**:
  - Bootstrap the Next.js application using `create-next-app` configured with TypeScript and Tailwind CSS.

### 4. Initial Database Migration
- Spin up the local PostgreSQL container via Docker Compose.
- Run `npx prisma migrate dev --name init` to physically create the tables.

---

## Phase 2: Event Ingestion (Kafka Producer)
**Goal**: Allow drivers to send GPS updates and reliably publish those updates to Kafka.

### 1. Defining the Contract
- Add the `LocationUpdateEvent` TypeScript interface in `packages/types` (lat, lng, timestamp, driverId, speed).

### 2. Kafka Configuration
- In `apps/api`, install `kafkajs`.
- Create a Kafka producer singleton that connects to the brokers defined in `packages/config` on startup.

### 3. API Ingress
- Create the `POST /api/location` endpoint.
- Validate incoming JSON payloads against a Zod schema.
- **Produce Event**: Call the Kafka producer to publish the event to the `location-updates` topic.
- **Crucial Step**: Set the Kafka message `key` to the `driverId`. This ensures partition ordering.

---

## Phase 3: Fast State (Redis & Location Consumer)
**Goal**: Consume events from Kafka and rapidly update the latest location in Redis.

### 1. Consumer Setup
- In `services/location-consumer`, configure a `kafkajs` consumer.
- Subscribe to the `location-updates` topic using consumer group `location-redis-updater`.

### 2. Redis Integration
- Connect to Redis using `ioredis`.
- On each Kafka message:
  - Upsert the data into Redis using the key `driver:{driverId}:location`.
  - Set an EXPIRE (TTL) of 60 seconds so offline drivers disappear automatically.

### 3. Pub/Sub Broadcasting
- Immediately after the Redis upsert, use `redis.publish('driver_updates:{driverId}', payload)` to notify the WebSocket servers.

---

## Phase 4: Real-Time Broadcast (WebSockets)
**Goal**: Push real-time updates to customer apps.

### 1. WebSocket Server Setup
- In `apps/api`, integrate `ws` or `socket.io` alongside the Express server.
- Implement connection authentication (e.g., via JWT in query params).

### 2. Subscription Management
- Listen for `{ action: "subscribe", driverId: "123" }` messages from clients.
- When a client subscribes:
  1. Fetch the driver's current location from Redis (via `ioredis` GET) and send it immediately.
  2. Map the client's WebSocket connection to that `driverId` in memory.

### 3. Redis Pub/Sub Listener
- Create a dedicated Redis subscriber client in the API Gateway.
- Use `psubscribe('driver_updates:*')` to listen for all location updates.
- When an update fires, find all WebSocket clients subscribed to that specific `driverId` and push the payload down the socket.

---

## Phase 5: Durable Storage (Persistence Consumer)
**Goal**: Save all location history into PostgreSQL efficiently without overwhelming the database.

### 1. Consumer Setup
- In `services/location-persistence`, configure a Kafka consumer.
- Subscribe to `location-updates` using consumer group `location-postgres-persister`.

### 2. Batching Strategy
- Accumulate incoming Kafka messages into an in-memory array.
- Flush the batch to the database when either:
  a. The array reaches 500 records.
  b. 2 seconds have elapsed since the last flush.

### 3. Database Insertion & Offsets
- Use Prisma's `createMany` to execute a bulk insert into `LocationHistory`.
- **Crucial Step**: Disable `autoCommit` in KafkaJS. Manually commit the Kafka offsets *only after* the Prisma `createMany` promise resolves successfully.

---

## Phase 6: Frontend Development
**Goal**: Visualize the real-time data on a map.

### 1. Map Integration
- In `apps/web`, integrate Mapbox GL JS or Google Maps API.
- Create a map component that accepts an array of driver markers.

### 2. WebSocket Client
- Create a React context/hook to manage the WebSocket connection to the API Gateway.
- Dispatch subscription messages for specific drivers.
- Update React state smoothly as new location events arrive over the socket, moving the map markers.

---

## Phase 7: Observability & Production Readiness
**Goal**: Harden the system for production deployment.

### 1. Metrics & Monitoring
- Install `prom-client` to expose `/metrics` endpoints.
- Track Kafka consumer lag, API HTTP latency, and active WebSocket connection counts.

### 2. Rate Limiting
- Add `express-rate-limit` to the `POST /api/location` endpoint to prevent spam/DDoS.

### 3. Dead Letter Queues (DLQ)
- Wrap Kafka message processing in `try/catch`.
- If a message causes unrecoverable database errors (poison pill), publish the raw message to a `location-updates-dlq` topic and commit the offset to prevent infinite crashing loops.

### 4. Integration Testing
- Use `testcontainers-node` and `Jest` to spin up ephemeral Postgres, Redis, and Kafka containers.
- Write a critical path test: Post a location to the API -> Wait 1 second -> Assert Redis is updated -> Assert DB is updated.
