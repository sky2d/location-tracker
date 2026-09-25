# Real-Time Location Tracking System

**Current status: Architecture + scaffolding only**

## Project Overview
This is a portfolio-grade system design project for a real-time location tracking platform, similar to the core architecture of Uber or Ola live driver tracking.

It demonstrates how to build a scalable, event-driven system where drivers (or devices) continuously send GPS location updates, and customers or admins can track these locations in real time on a map.

## Goals
The system aims to demonstrate strong system-design concepts:
- Event-driven architecture using Apache Kafka
- Real-time communication via WebSockets
- Caching and fast state retrieval via Redis
- Durable historical data storage via PostgreSQL
- Horizontal scalability and fault tolerance
- Consumer groups and Kafka partitions for ordered processing

## Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript, WebSocket layer, Kafka
- **Infrastructure**: Apache Kafka, Redis, PostgreSQL, Docker Compose

## Repository Structure (Monorepo)
- `apps/web`: Next.js frontend for driver and customer views.
- `apps/api`: Express WebSocket API gateway.
- `services/location-consumer`: Updates Redis with the latest driver location.
- `services/analytics-consumer`: Processes locations for metrics/analytics.
- `services/location-persistence`: Batches and saves historical location data to PostgreSQL.
- `packages/*`: Shared modules (types, config, logger).
- `infrastructure/*`: Scripts or configuration for external services (Kafka, DB).
- `docs/*`: Architecture and design documentation.

## Local Development Prerequisites
- Node.js (v18+)
- npm
- Docker and Docker Compose

To start the infrastructure locally:
```bash
docker-compose up -d
```
*(Application services are intentionally not implemented yet.)*

## Planned Features & Future Implementation Phases
1. **Phase 1: Foundational API & DB** - Setup Express, Prisma/PostgreSQL, basic CRUD.
2. **Phase 2: Event Backbone** - Integrate Kafka producer in API, implement consumers.
3. **Phase 3: Real-Time Layer** - WebSocket server integration, Redis pub/sub for scaling.
4. **Phase 4: Frontend** - Next.js map integration, connecting via WebSockets.
5. **Phase 5: Observability & Production Readiness** - Metrics, tracing, rate limiting.

## System Design Concepts Demonstrated
- **Backpressure**: Using Kafka to buffer high-throughput writes.
- **Ordering Guarantees**: Partitioning Kafka topics by `driverId` to ensure location updates process in the correct chronological order.
- **CQRS-like Pattern**: Separating current location state (Redis) from durable history storage (Postgres).
- **Scalability**: Stateless WebSocket APIs and independently scalable consumer services.
