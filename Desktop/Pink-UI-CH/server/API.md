/**
 * API.md - Voice Handler API Contract
 * 
 * Complete specification for the voice synthesis and delivery API.
 */

# Voice Handler API Specification

## Overview

The voice handler provides **low-latency text-to-speech synthesis** with intelligent caching, streaming support, and production metrics. Designed for real-time call center and voice assistant applications.

**Base URL**: `http://localhost:3001` (or deployed URL)

---

## Endpoints

### 1. POST /call

Synthesize text, upload to storage, and deliver to provider.

#### Request

```http
POST /call?debug=true
Content-Type: application/json

{
  "callId": "call-20240115-001",
  "text": "Hello, welcome to CallHub voice assistant.",
  "format": "MP3",
  "streaming": false
}
```

#### Parameters

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `callId` | string | Yes | - | Unique call identifier (UUID or timestamp-based) |
| `text` | string | Yes | - | Text to synthesize (1-5000 chars) |
| `format` | string | No | `MP3` | `MP3`, `LINEAR16`, `OGG_OPUS`, `MULAW` |
| `streaming` | boolean | No | `false` | Use streaming TTS if provider supports |
| `debug` | query param | No | `false` | Include detailed timing breakdown |

#### Response (Success)

```json
{
  "success": true,
  "callId": "call-20240115-001",
  "audioUrl": "https://s3.amazonaws.com/bucket/tts/voice-123/20240115-hash.mp3",
  "cached": false,
  "format": "MP3",
  "durationMs": 2500,
  "timings": {
    "request_received_ms": 0,
    "profile_fetch_ms": 45,
    "cache_lookup_ms": 2,
    "tts_generation_ms": 1820,
    "s3_upload_ms": 620,
    "provider_play_ms": 15,
    "total_ms": 2502
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` on 2xx response |
| `callId` | string | Echo of request callId |
| `audioUrl` | string | Public S3 URL to synthesized audio |
| `cached` | boolean | `true` if served from Redis cache |
| `format` | string | Actual audio format delivered |
| `durationMs` | number | Audio duration in milliseconds |
| `timings` | object | (only if debug=true) Detailed timing breakdown |

#### Response (Error)

```json
{
  "success": false,
  "error": "TTS synthesis failed after 3 attempts",
  "callId": "call-20240115-001"
}
```

#### Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success - audio synthesized, uploaded, and queued for playback |
| `400` | Bad request - missing/invalid parameters |
| `503` | Service unavailable - critical dependency down (Redis, S3, TTS) |
| `504` | Gateway timeout - TTS took >10s (configurable) |

#### Performance Characteristics

- **Cache hit**: 20-50ms (Redis lookup + provider play)
- **Cache miss**: 1800-2200ms (TTS synthesis + S3 upload + provider play)
- **Streaming mode**: Starts playback in 100-200ms, continues chunking
- **Retry overhead**: +500-1000ms per retry (exponential backoff)

---

### 2. GET /health

Health check endpoint for load balancers and orchestrators.

#### Request

```http
GET /health
```

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "checks": {
    "redis": "ok",
    "tts_provider": "ok",
    "s3_storage": "ok"
  }
}
```

---

### 3. GET /metrics

Prometheus-format metrics (for Prometheus scraping).

#### Request

```http
GET /metrics
```

#### Response

```
# HELP call_total Total calls processed
# TYPE call_total counter
call_total 1234

# HELP call_errors Total call errors
# TYPE call_errors counter
call_errors 5

# HELP tts_cache_hits Cache hits for TTS
# TYPE tts_cache_hits counter
tts_cache_hits 892

# HELP tts_cache_misses Cache misses for TTS
# TYPE tts_cache_misses counter
tts_cache_misses 342

# HELP tts_generation_ms Histogram of TTS generation times
# TYPE tts_generation_ms histogram
tts_generation_ms_bucket{le="100"} 0
tts_generation_ms_bucket{le="500"} 12
tts_generation_ms_bucket{le="1000"} 89
tts_generation_ms_bucket{le="2000"} 240
tts_generation_ms_bucket{le="+Inf"} 342
tts_generation_ms_sum 580000
tts_generation_ms_count 342
```

**Useful for**: Prometheus, Grafana, DataDog, New Relic

---

### 4. GET /metrics.json

JSON metrics endpoint (for programmatic access).

#### Request

```http
GET /metrics.json
```

#### Response

```json
{
  "counters": {
    "call_total": 1234,
    "call_errors": 5,
    "tts_cache_hits": 892,
    "tts_cache_misses": 342,
    "tts_retries": 3,
    "s3_uploads": 345,
    "provider_calls": 1234
  },
  "histograms": {
    "tts_generation_ms": {
      "count": 342,
      "avg": 1695,
      "p99": 2850,
      "p50": 1620
    },
    "s3_upload_ms": {
      "count": 345,
      "avg": 580,
      "p99": 1200,
      "p50": 480
    },
    "call_total_ms": {
      "count": 1234,
      "avg": 1850,
      "p99": 3200,
      "p50": 1750
    },
    "provider_response_ms": {
      "count": 1234,
      "avg": 45,
      "p99": 200,
      "p50": 30
    }
  }
}
```

---

## Error Handling

### Common Errors

#### 400: Missing Required Field

```json
{
  "success": false,
  "error": "Missing required field: text",
  "code": "INVALID_REQUEST"
}
```

#### 503: Redis Unavailable

```json
{
  "success": false,
  "error": "Cache service unavailable - using TTS passthrough",
  "code": "DEGRADED_MODE"
}
```

**Note**: Service can operate without Redis (slower but still functional).

#### 504: TTS Timeout

```json
{
  "success": false,
  "error": "TTS synthesis timeout (10000ms)",
  "code": "TIMEOUT"
}
```

**Note**: Can be retried after brief delay.

---

## Request/Response Examples

### Example 1: Basic Text Synthesis

```bash
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-001",
    "text": "Thank you for calling. Your account balance is $500."
  }'
```

**Response**:
```json
{
  "success": true,
  "callId": "call-001",
  "audioUrl": "https://s3.amazonaws.com/callhub-audio/tts/voice-default/20240115-abc123.mp3",
  "cached": false,
  "format": "MP3",
  "durationMs": 3400
}
```

### Example 2: With Debug Timing

```bash
curl -X POST "http://localhost:3001/call?debug=true" \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-002",
    "text": "Please wait while we connect you to an agent."
  }'
```

**Response**:
```json
{
  "success": true,
  "callId": "call-002",
  "audioUrl": "https://s3.amazonaws.com/callhub-audio/tts/voice-default/20240115-def456.mp3",
  "cached": false,
  "format": "MP3",
  "durationMs": 2800,
  "timings": {
    "request_received_ms": 0,
    "profile_fetch_ms": 42,
    "cache_lookup_ms": 1,
    "tts_generation_ms": 1920,
    "s3_upload_ms": 650,
    "provider_play_ms": 12,
    "total_ms": 2625
  }
}
```

### Example 3: Cache Hit (Repeated Call)

```bash
# Second call with same text
curl -X POST "http://localhost:3001/call?debug=true" \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-003",
    "text": "Please wait while we connect you to an agent."
  }'
```

**Response**:
```json
{
  "success": true,
  "callId": "call-003",
  "audioUrl": "https://s3.amazonaws.com/callhub-audio/tts/voice-default/20240115-def456.mp3",
  "cached": true,
  "format": "MP3",
  "durationMs": 2800,
  "timings": {
    "request_received_ms": 0,
    "profile_fetch_ms": 40,
    "cache_lookup_ms": 2,
    "tts_generation_ms": 0,
    "s3_upload_ms": 0,
    "provider_play_ms": 8,
    "total_ms": 50
  }
}
```

**Note**: 50ms total (vs 2625ms for cache miss) = **52x speedup** ⚡

### Example 4: Streaming Mode

```bash
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-004",
    "text": "Welcome to our automated service. Please listen carefully to the following options...",
    "streaming": true
  }'
```

**Response**:
```json
{
  "success": true,
  "callId": "call-004",
  "audioUrl": "https://s3.amazonaws.com/callhub-audio/tts/voice-default/20240115-ghi789.mp3",
  "cached": false,
  "format": "MP3",
  "durationMs": 8200,
  "timings": {
    "request_received_ms": 0,
    "profile_fetch_ms": 38,
    "cache_lookup_ms": 1,
    "tts_generation_ms": 180,
    "s3_upload_ms": 0,
    "provider_play_ms": 85,
    "total_ms": 304
  }
}
```

**Note**: Streaming starts playback in 180ms, then chunks audio in real-time.

---

## Authentication & Security

### Current Implementation
- **No authentication** (design choice for internal-only service)
- Deploy behind API gateway / VPN / network boundary

### Recommended Additions

For production:

```javascript
// Option 1: API Key
if (req.headers['x-api-key'] !== process.env.API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// Option 2: JWT
const token = req.headers['authorization']?.split(' ')[1];
jwt.verify(token, process.env.JWT_SECRET);

// Option 3: mTLS
// Configure certificate-based client authentication
```

---

## Rate Limiting

### Current Implementation
- **No rate limiting** (handle at reverse proxy / gateway)

### Recommended Implementation

```javascript
// Use rate-limit package
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,            // 1000 requests per minute per IP
});

router.post('/call', limiter, async (req, res) => {
  // ...
});
```

---

## Content Type Support

### Audio Formats

All formats supported by Google Cloud Text-to-Speech:

| Format | MIME Type | Use Case |
|--------|-----------|----------|
| **MP3** | audio/mpeg | Default, universal support, smaller file size |
| **LINEAR16** | audio/l16 | Telephony, VoIP, minimal encoding |
| **OGG_OPUS** | audio/ogg | Modern browsers, adaptive bitrate |
| **MULAW** | audio/mulaw | Legacy phone systems |

Request via `format` parameter:
```json
{
  "text": "Hello",
  "format": "LINEAR16"  // returns LINEAR16 audio
}
```

---

## Caching Behavior

### Cache Key Generation

```
Key: tts:{voiceId}:{SHA256(text)}
```

Example:
```
tts:voice-123:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### Cache TTL (Time-To-Live)

Default: **7 days** (configurable)

```javascript
// Set via environment
CACHE_TTL_HOURS=168  // 7 days
```

### Cache Invalidation

Manual invalidation:
```bash
# Delete specific cache entry
curl -X DELETE http://localhost:3001/cache/tts:voice-123:abc123

# Clear all cache
curl -X DELETE http://localhost:3001/cache
```

---

## Retry Logic

Automatic retries on transient failures:

| Error Type | Retries | Backoff |
|-----------|---------|---------|
| Network timeout | 3 | 100ms → 500ms → 2500ms |
| HTTP 429 (rate limit) | 3 | Exponential + jitter |
| HTTP 5xx (server error) | 3 | Exponential + jitter |
| S3 upload failure | 3 | Exponential + jitter |

**Not retried**: 400 (bad request), 401 (auth), 403 (forbidden)

---

## Deployment Checklist

- [ ] Configure Redis credentials (`.env`)
- [ ] Configure AWS S3 credentials (`.env`)
- [ ] Configure Google Cloud TTS credentials (`.env`)
- [ ] Run database migrations (voice profiles)
- [ ] Pre-synthesize common phrases (`npm run presynthesize`)
- [ ] Run E2E tests (`npm test`)
- [ ] Configure monitoring (Prometheus scrape config)
- [ ] Set up alerting (error rate >1%, p99 >3000ms)
- [ ] Configure reverse proxy / API gateway
- [ ] Enable HTTPS/TLS
- [ ] Implement rate limiting at gateway
- [ ] Set up log aggregation (CloudWatch, ELK, etc.)
- [ ] Configure auto-scaling / load balancing

---

## Troubleshooting

### Service Responds Slowly

1. Check cache hit rate: `GET /metrics.json` → `tts_cache_hits / (tts_cache_hits + tts_cache_misses)`
2. If <80%: Run pre-synthesis `npm run presynthesize`
3. Check TTS provider latency (p99 in metrics)
4. Check S3 upload latency (check AWS region proximity)

### High Error Rate

1. Check Redis connectivity: `redis-cli ping`
2. Check AWS S3 credentials: `aws s3 ls`
3. Check TTS API quota: Google Cloud Console
4. Review error logs: `LOG_LEVEL=debug npm start`

### Audio Quality Issues

1. Verify audio format: Set `format: "LINEAR16"` (highest quality)
2. Test with different voice ID (check `config/voices.json`)
3. Verify TTS provider language setting matches text language

---

## Version History

- **v1.0.0** (2024-01-15)
  - Initial release
  - POST /call with caching
  - Streaming TTS support
  - Prometheus metrics
  - Pre-synthesis scripts
  - E2E tests

