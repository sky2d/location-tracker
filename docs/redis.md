# Redis Architecture

## Purpose
Redis acts as the highly available, low-latency "current state of the world" store. It caches the latest known location of every active driver.

## Conceptual Structure
**Key Pattern**: `driver:{driverId}:location`
**Data Type**: Hash or String (JSON serialized)

Example data stored:
- `latitude`
- `longitude`
- `timestamp`
- `status` (e.g., ONLINE, EN_ROUTE)
- `lastSeen`

## Why not PostgreSQL for Current Location?
Querying a relational database for a constantly updating value (e.g., 100,000 drivers updating every 3 seconds) creates massive write contention and slow read performance. Redis operates entirely in-memory, handling hundreds of thousands of operations per second with sub-millisecond latency.

## Time-to-Live (TTL) and Stale Data
Every location update in Redis should be set with a TTL (e.g., 60 seconds).
If a driver loses internet connection or stops sending events, their Redis key will automatically expire, preventing customers from seeing a "stale" location indefinitely.

## Future Geospatial Queries
Redis supports geospatial indexes. In the future, we can utilize `GEOADD` and `GEORADIUS` / `GEOSEARCH`.
- When a driver updates location, we update a key: `GEOADD drivers_online <longitude> <latitude> <driverId>`
- When a customer wants a ride, we query: `GEOSEARCH drivers_online FROMLONLAT <lng> <lat> BYRADIUS 5 km`

This makes finding nearby drivers extremely fast.
