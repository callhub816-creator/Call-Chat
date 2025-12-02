# CallHub Voice Optimization System

Production-ready Node.js/Express voice call optimization system with TTS caching, streaming support, and comprehensive metrics.

## Features

- **Per-Request Voice Resolution**: Server-side voice ID resolution prevents client spoofing
- **Redis + S3 Caching**: Cache synthesized audio with smart TTL management
- **Streaming TTS**: Forward audio chunks to provider in real-time (if supported)
- **Retry Logic**: Automatic exponential backoff for external API failures
- **Timing Logs**: Detailed per-stage timing breakdown for performance debugging
- **Prometheus Metrics**: Built-in metrics for TTS generation, cache hits/misses, call errors
- **Pre-synthesis Scripts**: Batch generate and cache common phrases
- **E2E Testing**: Full test harness with cache hit/miss verification

## Architecture

```
POST /call
  ↓
1. [Timing] Request received
2. [Profile] Fetch callee profile → resolve voice ID
3. [Cache] Check Redis for audio URL
   ├─ [HIT] → Play cached URL → Done
   └─ [MISS]
      ↓
4. [TTS] Synthesize audio (sync buffer or streaming)
5. [S3] Upload buffer to S3 (if not streaming)
6. [Cache] Store URL in Redis with TTL
7. [Provider] Play audio URL on active call
8. [Metrics] Record timing & success/failure
```

## Installation

### Prerequisites

- Node.js ≥16
- Redis (local or remote)
- AWS S3 (or compatible storage)
- Google Cloud Text-to-Speech (or other TTS provider)

### Setup

```bash
cd server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Ensure Redis is running
redis-cli ping  # Should return PONG

# Start server
npm start
# or with debug logging:
DEBUG=* npm start
```

## Usage

### Basic Call Handler

```bash
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-12345",
    "text": "Hello, welcome to CallHub!",
    "format": "MP3"
  }'
```

### With Debug Timing

```bash
curl -X POST http://localhost:3001/call?debug=true \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-12345",
    "text": "Hello, welcome to CallHub!",
    "streaming": false
  }'
```

Response (with timings):

```json
{
  "success": true,
  "callId": "call-12345",
  "cached": false,
  "audioUrl": "https://s3.amazonaws.com/bucket/tts/.../audio.mp3",
  "timings": {
    "request_received_ms": 2,
    "profile_fetch_ms": 45,
    "voice_resolve_ms": 2,
    "cache_lookup_ms": 3,
    "tts_generate_ms": 1234,
    "s3_upload_ms": 567,
    "provider_play_ms": 89,
    "total_ms": 1942
  }
}
```

### Streaming Mode

```bash
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-12345",
    "text": "Real-time audio generation",
    "streaming": true
  }'
```

(Requires `ENABLE_STREAMING=true` in .env)

### Check Metrics

```bash
# Prometheus format
curl http://localhost:3001/metrics

# JSON format
curl http://localhost:3001/metrics.json
```

### Health Check

```bash
curl http://localhost:3001/health
```

## Configuration

### Environment Variables

```env
# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
S3_BUCKET=callhub-audio-cache
S3_REGION=us-east-1
S3_PUBLIC_BASE_URL=https://callhub-audio-cache.s3.us-east-1.amazonaws.com
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# TTS Provider
TTS_PROVIDER=google       # or aws-polly, azure
TTS_REGION=us-central1
TTS_API_KEY=xxx

# Caching
CACHE_TTL_SECONDS=2592000  # 30 days
CACHE_ENABLED=true

# Retry & Timeout
MAX_RETRIES=3
TTS_TIMEOUT_MS=10000
S3_TIMEOUT_MS=30000
PROVIDER_TIMEOUT_MS=5000

# Feature Flags
ENABLE_STREAMING=false     # Set to true for streaming TTS
ENABLE_PRESYNTHESIZE=true
DEBUG_TIMINGS=false

# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

## Pre-Synthesis (Batch Caching)

Pre-generate common phrases for faster first-response times:

```bash
node scripts/presynthesize.js
```

This will:
1. Read `config/phrases.json` (common phrases)
2. Read `config/voices.json` (voice profiles)
3. For each voice × phrase combination:
   - Synthesize audio via TTS provider
   - Upload to S3
   - Cache URL in Redis with TTL
4. Print summary of successes/failures

**Example phrases.json:**

```json
[
  {
    "text": "Hello, welcome to CallHub voice assistant.",
    "context": "greeting"
  },
  {
    "text": "Thank you for calling.",
    "context": "closing"
  }
]
```

**Example voices.json:**

```json
[
  {
    "id": "en-US-Neural2-A",
    "name": "Veena",
    "role": "assistant"
  }
]
```

## Testing

### Run E2E Test Suite

```bash
# Start server first
npm start &

# In another terminal
node tests/e2e.js
```

This will:
1. **Test 1**: Make a call (cache miss) with timing breakdown
2. **Test 2**: Repeat same call (cache hit) - compare timings
3. **Test 3**: Different text (new cache miss)
4. **Test 4**: Check metrics endpoint
5. **Test 5**: Health check

Sample output:

```
============================================================
TEST 1: First Call (Cache Miss)
============================================================
Response Status: SUCCESS
Cache Status: MISS

Timing Breakdown (ms):
  request_received_ms          : 1
  profile_fetch_ms             : 42
  voice_resolve_ms             : 1
  cache_lookup_ms              : 2
  tts_generate_ms              : 1234
  s3_upload_ms                 : 567
  provider_play_ms             : 34
  total_ms                     : 1881

============================================================
TEST 2: Repeated Call (Cache Hit)
============================================================
Response Status: SUCCESS
Cache Status: HIT

Timing Breakdown (ms):
  request_received_ms          : 0
  cache_lookup_ms              : 2
  provider_play_ms             : 15
  total_ms                     : 17

✓ 5/5 tests passed
```

## Performance Tuning

### Reduce TTS Latency

1. **Use streaming** if provider supports it:
   ```env
   ENABLE_STREAMING=true
   ```

2. **Request provider-native audio format** (avoid re-encoding):
   ```
   Audio Format → MP3 (16kHz, mono)
   vs.
   Audio Format → LINEAR16 (requires ffmpeg conversion)
   ```

3. **Pre-synthesize common phrases**:
   ```bash
   node scripts/presynthesize.js
   ```
   
   This caches high-frequency utterances (greetings, transfers, etc.).

### Cache Hit Rates

Check metrics to understand cache effectiveness:

```bash
curl http://localhost:3001/metrics.json | jq '.counters'
```

Target: >80% cache hit rate for production voice assistants.

### S3 Upload Optimization

- Use **streaming upload** for large audio files (see `lib/storage.js`)
- Enable **multipart upload** (automatic in AWS SDK v3)
- Consider **CloudFront** CDN for geographic distribution

## Integration Examples

### Twilio Integration

```javascript
// lib/provider.js (replace mock)

const twilio = require('twilio');

async playUrl(callId, url) {
  const client = twilio(accountSid, authToken);
  const call = await client.calls(callId).update({
    url: `https://your-twiml-server/play?audio=${encodeURIComponent(url)}`,
  });
  return !!call.sid;
}
```

### AWS Polly TTS

```javascript
// lib/ttsAdapter.js (replace google)

const AWS = require('aws-sdk');
const polly = new AWS.Polly();

async _pollySpeak({ voice, text, format }) {
  const response = await polly.synthesizeSpeech({
    Engine: 'neural',
    OutputFormat: format === 'LINEAR16' ? 'pcm' : 'mp3',
    Text: text,
    VoiceId: voice,
  }).promise();
  return response.AudioStream;
}
```

## Troubleshooting

### Cache Misses Every Call

Check Redis connection:

```bash
redis-cli ping          # Should return PONG
redis-cli keys "tts:*"  # Should show cached keys
```

### Slow TTS Generation

1. Check TTS API quotas/rate limits
2. Monitor `tts_generation_ms` via metrics
3. Consider pre-synthesis for common phrases
4. Enable streaming mode if available

### S3 Upload Failures

1. Verify AWS credentials in `.env`
2. Check S3 bucket permissions (should allow `PutObject`)
3. Ensure bucket exists and is in correct region
4. Monitor S3 metrics: `curl http://localhost:3001/metrics.json | jq '.counters | .s3_upload_failures'`

### Provider Playback Issues

1. Verify provider accepts public HTTPS URLs
2. Check S3 object ACL is `public-read`
3. Confirm audio format matches provider requirements
4. Enable debug logging: `DEBUG=* npm start`

## File Structure

```
server/
├── .env.example                 # Environment template
├── server.js                    # Main Express server
├── package.json                 # Dependencies
├── lib/
│   ├── cache.js                 # Redis caching layer
│   ├── storage.js               # S3 upload helpers
│   ├── ttsAdapter.js            # TTS provider adapter
│   ├── provider.js              # Telephony provider adapter
│   ├── metrics.js               # Prometheus metrics
│   ├── retry.js                 # Retry with exponential backoff
│   └── logger.js                # Structured logging
├── routes/
│   └── call.js                  # POST /call handler
├── scripts/
│   └── presynthesize.js         # Batch TTS synthesis & caching
├── tests/
│   └── e2e.js                   # End-to-end test suite
└── config/
    ├── phrases.json             # Common phrases for pre-synthesis
    └── voices.json              # Voice profiles & defaults
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS for all external APIs
- [ ] Use managed Redis (Redis Cloud, ElastiCache)
- [ ] Implement custom auth for `/call` endpoint
- [ ] Enable request rate limiting (express-rate-limit)
- [ ] Set up monitoring/alerting for metrics
- [ ] Configure CloudFront CDN for S3 audio distribution
- [ ] Test failover scenarios (Redis down, S3 timeout, provider error)
- [ ] Implement request ID tracking for debugging
- [ ] Archive old cached audio in S3 Glacier for cost reduction
- [ ] Set up automated security scanning
- [ ] Document custom voice profiles in voices.json

## License

MIT
