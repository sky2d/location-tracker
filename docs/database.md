# PostgreSQL Architecture

## Purpose
PostgreSQL is the durable storage layer. It handles application state (users, auth, billing) and the permanent, immutable history of driver locations.

## Conceptual Entities
- **User**: Customers using the platform.
- **Driver**: Drivers providing the service.
- **Ride**: The transactional entity linking a User, Driver, and payments.
- **LocationHistory**: Time-series log of all location pings.

## Why PostgreSQL?
We need strong ACID guarantees for financial transactions (Rides) and user accounts. While a NoSQL database might be theoretically better purely for the `LocationHistory` time-series data, Postgres is highly capable and simplifies the architecture for this portfolio project.

## Division of Responsibility (Redis vs Postgres)
- **Redis**: "Where is the driver *right now*?"
- **Postgres**: "Where was the driver *last Tuesday at 4 PM*?"

Current location reads (which happen millions of times a minute for active tracking) **must never** hit Postgres.

## Location History Storage Strategy
The `LocationHistory` table is append-only.
- The `location-persistence` consumer reads batches of events from Kafka.
- It performs bulk inserts (`INSERT INTO ... VALUES (), (), ()`) to reduce database connections and IO overhead.

## Indexing Considerations
To retrieve historical routes efficiently, the `LocationHistory` table must be indexed appropriately.
- Primary Key: `(driverId, timestamp)` or `eventId`
- Index on `driverId` and `timestamp` (B-Tree) to quickly fetch ranges of location points for a specific ride.

## Possible Partitioning Strategy
Over time, the `LocationHistory` table will grow massive (billions of rows).
PostgreSQL table partitioning (e.g., partitioning by `timestamp` month-by-month or day-by-day) should be considered to keep index sizes manageable and allow for easy archiving or dropping of old data.
