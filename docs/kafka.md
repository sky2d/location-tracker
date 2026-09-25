# Apache Kafka Architecture

## Why Kafka?
Kafka is chosen as the event backbone for this system over RabbitMQ, direct API calls, or database polling because:
- **High Throughput & Backpressure**: It can absorb massive spikes in traffic (e.g., tens of thousands of drivers coming online simultaneously) without overwhelming downstream services.
- **Durability**: Events are written to disk, preventing data loss if consumers fail.
- **Multiple Consumers**: Allows different services (Redis updater, Analytics, Postgres persistence) to read the same stream of events at their own pace.

## Topic Structure
**Topic Name**: `location-updates`

**Message Schema**:
```json
{
  "eventId": "uuid",
  "driverId": "uuid",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2023-10-27T10:00:00Z",
  "accuracy": 5.2,
  "speed": 15.5
}
```

## Partitioning Strategy
Messages are partitioned by `driverId`.
- **Reasoning**: Kafka guarantees ordering only within a single partition. By using `driverId` as the key, we ensure that location updates for a specific driver are always appended to the same partition. This guarantees that consumers process a driver's locations in the exact chronological order they were sent.

## Consumer Groups
Consumers are logically grouped to divide work.
- `location-redis-updater-group`: Updates Redis.
- `location-postgres-persister-group`: Writes to DB.
- `location-analytics-group`: Calculates metrics.
Each group maintains its own offset, meaning the Postgres writer can be slow without slowing down the real-time Redis updates.

## Offset Management & Delivery Guarantees
We aim for **at-least-once processing**.
Consumers pull data, process it, and *then* commit the offset. If a consumer crashes midway, the offset is not committed, and the next consumer will re-read the message. 

## Duplicate Events & Idempotency
Because of at-least-once delivery, consumers might receive the same message twice.
- **Redis Consumer**: Updating the same `(driverId, lat, lng)` in Redis is naturally idempotent.
- **Postgres Consumer**: Must handle `ON CONFLICT DO NOTHING` if using `eventId` as a unique primary key in the history table.

## Consumer Failure & Rebalancing
If a consumer instance dies, Kafka automatically triggers a rebalance, assigning its partitions to other healthy instances in the consumer group.

## Dead-letter Strategy
If an event payload is malformed, it should be caught at the Ingress layer. If a processing error occurs downstream, the event should be routed to a Dead Letter Topic (e.g., `location-updates-dlt`) rather than blocking the partition indefinitely.
