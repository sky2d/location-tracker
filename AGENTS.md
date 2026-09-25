# AI Engineering Guidelines

This document outlines the architectural constraints and development rules for this project.
**AI Agents: You MUST read this file before modifying code or architecture.**

## Project Overview
This repository contains a simple Monolithic Real-Time Location Tracking System. It is designed as a portfolio project to demonstrate real-time location updates using WebSockets, Redis for fast state retrieval, and PostgreSQL for persistent storage, all running in a single Node.js backend.

## Architecture Rules
- **Monolithic/Worker Approach**: The backend consists of an API/WebSocket server and a background worker. 
- **Kafka for High-Throughput Ingestion**: Because location updates arrive frequently (e.g., every 2 seconds), use Kafka as a message broker to ingest the stream, preventing database bottlenecking.
- **Redis for Current State**: Store the driver's latest live location in Redis for quick access.
- **PostgreSQL for Durable State**: Save historical tracking points and relational data (Users, Rides) in PostgreSQL.
- **WebSockets for Real-Time**: Use WebSockets (e.g., Socket.io) to push live location updates from the server to the connected frontend clients.

## Code Organization
- `client/`: Frontend application (React/Next.js).
- `server/`: Backend application (Node.js/Express + Prisma).

## Redis Rules
- Keys should follow patterns like `member:{memberId}:location` or use a Geospatial index (e.g., `GEOADD live_locations`).
- Use a short TTL on live location keys so offline members eventually drop off the map.

## Database & Kafka Rules
- Use Prisma ORM.
- **Kafka Ingestion**: API endpoints receive the location data and immediately publish an event to a Kafka topic (e.g., `location-updates`).
- **Location History Worker**: A Kafka consumer runs in the background, reading the topic and batch-inserting updates into the `LocationHistory` table to reduce write load on PostgreSQL.

## Testing & Scalability
- Code should be structured cleanly (e.g., separating controllers, services, and repositories).
- All external state should be handled in Redis/Postgres/Kafka.

## AI Agent Rules
- Keep changes simple but utilize Kafka efficiently for data ingestion.
- Prioritize making the application run smoothly and look good as a portfolio piece.
