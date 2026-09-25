# Implementation TODO List

This document outlines the actionable steps required to implement the Monolithic Real-Time Location Tracking System.

## Phase 1: Foundation & Setup
- [x] **Initialize Project**: Run `npm init` in the root. Set up a simple monolithic structure with `client/` and `server/` folders.
- [x] **Server Setup (`server/`)**: Initialize a Node.js Express application.
- [x] **Client Setup (`client/`)**: Scaffold a React/Next.js application.
- [x] **Database Setup**: Initialize Prisma ORM in the `server/` directory. Define schemas for `User`, `Driver`, `Ride`, and `LocationHistory`. Run migrations against Postgres.

## Phase 2: Core Server & Database Logic
- [x] **Express API**: Create basic REST endpoints for driver and user authentication/registration.
- [x] **Redis Setup**: Connect the Express server to Redis.
- [x] **Kafka Setup**: Set up Kafka in `docker-compose.yml` and initialize a Kafka producer client in the server.
- [x] **Location Update Endpoint**: Create a fast `POST /api/location` endpoint (or use WebSocket) for active members to send their location. Update Redis with the current state, and **publish a message to a Kafka topic** (`location-updates`).
- [x] **Kafka Consumer Worker**: Create a background consumer that reads from the `location-updates` topic and batch-inserts the records into the PostgreSQL `LocationHistory` table.

## Phase 3: Real-Time WebSockets
- [x] **WebSocket Server**: Integrate `socket.io` or `ws` into the Express server.
- [x] **Client Subscriptions**: Allow the client to subscribe to a global `live-locations` room to receive location updates for all active members on the dashboard.
- [x] **Live Broadcasting**: Whenever the server receives a location update from a member, immediately broadcast it over WebSockets to all clients subscribed to the global dashboard.

## Phase 4: Frontend Development
- [x] **Map Integration**: Integrate a mapping library (e.g., Leaflet or Mapbox) into the React app to serve as the global dashboard.
- [x] **WebSocket Client**: Connect to the backend WebSocket server and listen for all global location updates.
- [x] **Real-Time UI**: Render and animate multiple markers on the dashboard map for all active members as updates arrive.
- [x] **Member Simulator**: Create a simple page or script to mock multiple members moving and sending their locations continuously to populate the dashboard.
