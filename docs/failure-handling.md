# System Failure Scenarios

This document outlines how the architecture handles various partial system failures.

### 1. Kafka Broker Failure
- **What happens**: A Kafka node goes down.
- **Detection**: Zookeeper/KRaft detects the missing heartbeat.
- **Recovery**: Another broker in the cluster takes over leadership of the downed broker's partitions. Producers and consumers automatically failover to the new leader.
- **Data Loss**: None, assuming replication factor > 1 and `acks=all`.

### 2. Kafka Consumer Failure
- **What happens**: The `location-persistence` consumer crashes.
- **Detection**: Kafka cluster notices the consumer group member stopped polling.
- **Recovery**: A consumer group rebalance occurs. The partitions assigned to the dead consumer are reassigned to healthy instances in the same group.
- **Data Loss**: None. The offset was never committed, so the new consumer reads from the last known good state.

### 3. WebSocket Server Failure
- **What happens**: WS Node 1 crashes, dropping 5,000 customer connections.
- **Detection**: Load balancer health checks fail; clients detect dropped sockets.
- **Recovery**: Clients trigger auto-reconnect logic, hitting the Load Balancer, which routes them to healthy WS Nodes 2 and 3. 
- **Data Loss**: A few seconds of live map updates for those users while they reconnect. State is preserved in Redis.

### 4. Redis Failure
- **What happens**: Redis crashes and loses memory.
- **Detection**: APIs and consumers throw connection errors.
- **Recovery**: Redis restarts. Initially, the map is empty. However, because drivers continuously broadcast GPS (every 3 seconds), the Kafka consumers will rapidly rebuild the current state in Redis within seconds.
- **Data Loss**: Transient live state is lost but instantly rebuilt.

### 5. PostgreSQL Failure
- **What happens**: The DB goes offline.
- **Detection**: The `location-persistence` consumer fails to write batches.
- **Recovery**: The consumer retries. Because it cannot write, it cannot commit Kafka offsets. It acts as a backpressure mechanism. Kafka simply holds the events on disk until Postgres comes back online.
- **Data Loss**: None. Kafka durably buffers the data.

### 6. Driver Losing Internet
- **What happens**: Driver enters a tunnel.
- **Detection**: The Redis TTL for `driver:{id}:location` expires after 60 seconds.
- **Recovery**: The WebSocket server notifies the customer that the driver's signal is lost. When the driver emerges, their device flushes buffered events to Kafka, and the state updates.

### 7. Duplicate Location Event
- **What happens**: A network retry causes a device to send the exact same payload twice.
- **Recovery**: The consumer upserts to Redis (overwriting with the exact same data—no issue). Postgres relies on `eventId` uniqueness to ignore the duplicate.

### 8. Out-of-Order Location Event
- **What happens**: A device sends a Timestamp 10:00 event, then a 09:59 event due to weird client queuing.
- **Recovery**: The Redis updater should ideally check if the incoming `timestamp` > the existing `timestamp` before overwriting.

### 9. High Traffic Spike (e.g., Event completion)
- **What happens**: 100,000 people request rides simultaneously.
- **Recovery**: Kafka buffers the immense wave of location updates. Consumers process as fast as they can (lag increases). The system degrades gracefully by delaying the data rather than crashing the database.
