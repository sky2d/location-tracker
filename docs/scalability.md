# Scalability

## Target Scenario
- 100,000+ active drivers.
- Location sent every 2-5 seconds.
- Tens of thousands of events per second.

## How the system scales

### 1. Ingress Layer (API Gateway / WebSockets)
- Completely stateless.
- Horizontally scalable by adding more Docker/ECS containers behind an Application Load Balancer.

### 2. Kafka Layer
- Partitioning by `driverId` allows us to increase the number of partitions.
- More partitions = more concurrent consumers allowed in a consumer group.
- Scaling from 10k to 100k TPS requires provisioning larger brokers or adding more brokers to the cluster.

### 3. Processing Layer (Consumers)
- Add more instances of `location-consumer` or `location-persistence`.
- Kafka will automatically rebalance partitions among the instances.

### 4. Storage Layer
- **Redis**: For 100k active drivers, the data fits easily in memory on a single Redis node. If throughput hits limits, Redis Cluster can shard keys across multiple nodes.
- **Postgres**: Batch inserts reduce overhead. If reads/history queries become slow, we introduce read replicas and partition the `LocationHistory` table by time (e.g., monthly).
