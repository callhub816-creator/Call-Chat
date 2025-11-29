# Quick Start Guide - CallHub Voice Optimization

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit credentials (minimal required)
cat .env
# Make sure these are set:
# - REDIS_URL (local default: redis://localhost:6379)
# - S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# - TTS_API_KEY
```

### 3. Start Redis

```bash
# If using local Redis
redis-server

# Or connect to remote
# Update REDIS_URL in .env
```

### 4. Start Server

```bash
npm start
# Server running on http://localhost:3001
```

### 5. Test Basic Call

```bash
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "test-1",
    "text": "Hello, this is a test.",
    "format": "MP3"
  }'
```

Expected response:
```json
{
  "success": true,
  "callId": "test-1",
  "cached": false,
  "audioUrl": "https://s3.amazonaws.com/bucket/tts/.../audio.mp3"
}
```

## Testing Cache Hit/Miss

```bash
# First call (cache miss)
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{"callId":"test-1","text":"Hello"}' \
  # Returns: "cached": false

# Second call with same text (cache hit)
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{"callId":"test-2","text":"Hello"}' \
  # Returns: "cached": true ✓
```

## View Timing Breakdown

```bash
# Add ?debug=true to see detailed timings
curl -X POST "http://localhost:3001/call?debug=true" \
  -H "Content-Type: application/json" \
  -d '{"callId":"test-1","text":"Hello"}'
```

Response includes:
```json
{
  "timings": {
    "request_received_ms": 1,
    "profile_fetch_ms": 42,
    "cache_lookup_ms": 2,
    "tts_generate_ms": 1234,
    "s3_upload_ms": 567,
    "provider_play_ms": 34,
    "total_ms": 1880
  }
}
```

## Run Full E2E Test

```bash
# Keep server running, open new terminal
node tests/e2e.js
```

Output shows:
- ✓ Health check
- ✓ Cache miss timing
- ✓ Cache hit timing (much faster!)
- ✓ Different text (new miss)
- ✓ Metrics aggregation

## Pre-Synthesize Common Phrases

```bash
node scripts/presynthesize.js
```

This pre-generates and caches common greeting/closing phrases for all voices, reducing first-call latency.

## Check Metrics

```bash
# Prometheus format
curl http://localhost:3001/metrics

# JSON format (easier to read)
curl http://localhost:3001/metrics.json | jq .
```

Metrics include:
- `tts_cache_hits` / `tts_cache_misses` — cache effectiveness
- `tts_generation_ms` — p99 latency
- `call_total` / `call_errors` — call volume and errors
- `call_total_ms` — end-to-end response time

## Troubleshooting

**"REDIS error: connect ECONNREFUSED"**
```bash
# Make sure Redis is running
redis-server
# Or set REDIS_URL to your remote Redis
```

**"S3 access denied"**
```bash
# Check AWS credentials in .env
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
# Verify bucket exists: S3_BUCKET=your-bucket-name
```

**"TTS API key invalid"**
```bash
# Verify TTS_API_KEY is correct
# For Google: download service account JSON and set GOOGLE_APPLICATION_CREDENTIALS
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## Next Steps

1. **Implement Provider Integration** → Edit `lib/provider.js` for your telephony system
2. **Custom Voice Profiles** → Edit `config/voices.json` to add more voices
3. **Add Request Auth** → Add middleware to `server.js` for API key validation
4. **Enable Streaming** → Set `ENABLE_STREAMING=true` in `.env` (if TTS supports it)
5. **Production Deploy** → Use PM2, Docker, or Kubernetes

## Example: Node Script Calling /call

```javascript
const http = require('http');

async function callVoiceHandler(text) {
  const body = JSON.stringify({
    callId: `call-${Date.now()}`,
    text,
    format: 'MP3',
    streaming: false,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/call?debug=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const result = JSON.parse(data);
        console.log(`✓ Audio generated in ${result.timings.total_ms}ms`);
        console.log(`✓ Cached: ${result.cached}`);
        console.log(`✓ URL: ${result.audioUrl}`);
        resolve(result);
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Usage
callVoiceHandler('Hello, welcome to CallHub!')
  .then(result => console.log('Done:', result.success))
  .catch(err => console.error('Error:', err.message));
```

---

**Need help?** Check the full README.md for advanced configuration and integration examples.
