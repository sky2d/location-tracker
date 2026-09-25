# Observability

This document outlines the strategy for monitoring the Real-Time Location Tracking System.

## 1. Structured Logging
All services (Web, API, Consumers) must use a structured JSON logger (e.g., `packages/logger` wrapping Pino).
- Essential fields: `timestamp`, `level`, `service`, `traceId`, `driverId`.

## 2. Distributed Tracing
When an event enters the API Gateway, a trace ID should be generated.
This trace ID must be attached to the Kafka message headers, allowing us to track an event from ingestion, through Kafka, into Redis, and finally to the WebSocket broadcast using tools like OpenTelemetry and Jaeger/DataDog.

## 3. Key Metrics
To be exported via Prometheus and visualized in Grafana:

### Kafka
- **Consumer Lag**: How far behind is the `location-persistence` consumer? If this spikes, we need more consumers.
- **Produce Latency**: How fast is the API gateway publishing to Kafka?

### Redis
- **Latency**: Ensure Upsert and Pub/Sub times remain < 2ms.
- **Hit/Miss Ratio**: When clients initially subscribe, do they hit valid data?

### PostgreSQL
- **Write Latency**: Time to execute a batch insert.
- **Active Connections**: Ensure consumer connection pooling doesn't exhaust DB limits.

### WebSocket
- **Active Connections**: Number of connected customers.
- **Disconnect Rate**: Frequency of dropped connections/reconnects.
