/**
 * INTEGRATION.md - Integration Guide
 * 
 * Step-by-step guide for integrating voice handler into existing services.
 */

# Integration Guide

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
- `REDIS_URL` - Redis connection string
- `AWS_ACCESS_KEY_ID` - AWS S3 credentials
- `AWS_SECRET_ACCESS_KEY` - AWS S3 credentials
- `AWS_S3_BUCKET` - S3 bucket name
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCP service account JSON

### 3. Start Server

```bash
npm start
# Server listens on http://localhost:3001
```

### 4. Test

```bash
# Basic health check
curl http://localhost:3001/health

# Synthesize a test phrase
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{"callId":"test-001","text":"Hello world"}'
```

---

## Architecture Overview

```
┌─────────────────┐
│  Incoming Call  │
│  (Twilio, etc)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Your Call Application             │
│   (handles IVR logic, transfers)    │
└────────┬────────────────────────────┘
         │
         │ POST /call
         │ {callId, text, format}
         │
         ▼
┌─────────────────────────────────────┐
│   Voice Synthesis Handler           │
│   (routes/call.js)                  │
└────────┬────────────────────────────┘
         │
         ├─► 1. Profile Fetch
         │   (get voice params from DB)
         │
         ├─► 2. Cache Lookup
         │   (Redis)
         │
         ├─► 3a. Cache HIT
         │   └─► S3 URL returned (20-50ms)
         │
         ├─► 3b. Cache MISS
         │   ├─► TTS Synthesis
         │   │   (Google Cloud, 1200-1500ms)
         │   │
         │   ├─► S3 Upload
         │   │   (500-700ms)
         │   │
         │   └─► Redis Cache Set
         │       (TTL: 7 days)
         │
         ├─► 4. Play Audio
         │   (provider.playUrl)
         │
         └─► 5. Return Response
             {audioUrl, cached, timings}
```

---

## Integration Patterns

### Pattern 1: Direct HTTP Integration

**Best for**: Existing call handlers that can make HTTP requests

#### Example (Node.js)

```javascript
// your-call-handler.js
const axios = require('axios');

async function handleCallLogic(callInfo) {
  const { callId, toNumber, fromNumber } = callInfo;
  
  // Your IVR logic...
  
  // When you need to play a message:
  const voiceResponse = await axios.post(
    'http://localhost:3001/call',
    {
      callId,
      text: `Hello ${fromNumber}, thank you for calling.`,
      format: 'MP3',
      debug: false,
    }
  );
  
  // voiceResponse.data.audioUrl contains the audio
  const { audioUrl, cached, timings } = voiceResponse.data;
  
  console.log(`Audio ready: ${audioUrl} (cached: ${cached})`);
  
  // Pass audioUrl to your telephony provider for playback
  await provider.playAudio(callId, audioUrl);
}
```

#### Example (Python)

```python
# your_call_handler.py
import requests
import json

def handle_call_logic(call_info):
    call_id = call_info['callId']
    message = "Thank you for calling."
    
    response = requests.post(
        'http://localhost:3001/call',
        json={
            'callId': call_id,
            'text': message,
            'format': 'MP3',
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        audio_url = data['audioUrl']
        print(f"Play audio: {audio_url}")
        # Pass to telephony provider
    else:
        print(f"Error: {response.text}")
```

#### Example (Java/Spring Boot)

```java
// CallHandler.java
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;

@Service
public class VoiceService {
    
    private final RestTemplate restTemplate;
    private static final String VOICE_API = "http://localhost:3001/call";
    
    public VoiceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    public String synthesizeAndPlay(String callId, String text) {
        Map<String, String> request = new HashMap<>();
        request.put("callId", callId);
        request.put("text", text);
        request.put("format", "MP3");
        
        try {
            Map<String, Object> response = restTemplate.postForObject(
                VOICE_API,
                request,
                Map.class
            );
            
            String audioUrl = (String) response.get("audioUrl");
            Boolean cached = (Boolean) response.get("cached");
            
            System.out.println("Audio: " + audioUrl + " (cached: " + cached + ")");
            return audioUrl;
        } catch (Exception e) {
            System.err.println("Voice synthesis failed: " + e.getMessage());
            return null;
        }
    }
}
```

---

### Pattern 2: Telephony Provider Integration

#### Twilio Integration Example

```javascript
// server.js - Twilio webhook receiver
const express = require('express');
const twilio = require('twilio');
const axios = require('axios');

const app = express();
app.use(express.urlencoded({ extended: false }));

// Webhook endpoint for incoming calls
app.post('/webhook/twilio', async (req, res) => {
  const callSid = req.body.CallSid;
  const from = req.body.From;
  
  const twiml = new twilio.twiml.VoiceResponse();
  
  try {
    // Step 1: Get message to synthesize from your logic
    const message = await getGreetingMessage(from);
    
    // Step 2: Call voice handler
    const voiceResponse = await axios.post(
      'http://localhost:3001/call',
      {
        callId: callSid,
        text: message,
        format: 'MP3',
      }
    );
    
    const { audioUrl } = voiceResponse.data;
    
    // Step 3: Add play action to TwiML
    twiml.play(audioUrl);
    
    // Step 4: Gather input
    const gather = twiml.gather({
      numDigits: 1,
      action: '/webhook/twilio/gather',
    });
    gather.say('Press 1 for sales, 2 for support, or 3 to speak with an agent.');
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    console.error('Error:', err.message);
    
    // Fallback: use Twilio built-in TTS
    twiml.say('Sorry, the system encountered an error.');
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

app.listen(3000);
```

#### AWS Connect Integration

```javascript
// lambda/voiceHandler.js - AWS Lambda function
const axios = require('axios');

exports.handler = async (event) => {
  const contactId = event.Details.ContactData.ContactId;
  const message = event.Details.Parameters.Message;
  
  try {
    // Call voice handler
    const response = await axios.post(
      process.env.VOICE_HANDLER_URL + '/call',
      {
        callId: contactId,
        text: message,
        format: 'LINEAR16', // AWS Connect prefers LINEAR16
      },
      { timeout: 10000 }
    );
    
    const { audioUrl, cached } = response.data;
    
    console.log(`Synthesized: ${audioUrl} (cached: ${cached})`);
    
    return {
      audioUrl: audioUrl,
      cached: cached,
    };
  } catch (err) {
    console.error('Voice synthesis failed:', err.message);
    throw err;
  }
};

// Lambda environment variables:
// VOICE_HANDLER_URL = http://internal-nlb:3001
```

---

### Pattern 3: Message Queue Integration

For high-concurrency scenarios, use a message queue instead of direct HTTP:

#### RabbitMQ / Bull Queue Example

```javascript
// worker.js - Background worker
const Queue = require('bull');
const axios = require('axios');

const voiceQueue = new Queue('voice-synthesis', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Process jobs from queue
voiceQueue.process(async (job) => {
  const { callId, text, format } = job.data;
  
  console.log(`Processing: ${callId}`);
  
  const response = await axios.post(
    'http://localhost:3001/call',
    { callId, text, format }
  );
  
  return response.data;
});

// In your call handler: add job to queue instead of calling directly
async function handleCall(callInfo) {
  const { callId, message } = callInfo;
  
  // Add to queue (returns immediately)
  const job = await voiceQueue.add(
    {
      callId,
      text: message,
      format: 'MP3',
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    }
  );
  
  console.log(`Job queued: ${job.id}`);
}
```

---

## Database Integration

### Storing Voice Profiles

```sql
-- Create voices table
CREATE TABLE voices (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  role VARCHAR(50),          -- 'assistant', 'representative', 'bot'
  gender VARCHAR(10),        -- 'MALE', 'FEMALE', 'NEUTRAL'
  language VARCHAR(10),      -- 'en-US', 'hi-IN', etc.
  provider VARCHAR(50),      -- 'google_cloud', 'aws_polly', etc.
  provider_voice_id VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Example data
INSERT INTO voices VALUES
  ('voice-assistant-en', 'Assistant English', 'assistant', 'FEMALE', 'en-US', 'google_cloud', 'en-US-Neural2-C', NOW(), NOW()),
  ('voice-assistant-hi', 'Assistant Hindi', 'assistant', 'FEMALE', 'hi-IN', 'google_cloud', 'hi-IN-Neural2-A', NOW(), NOW()),
  ('voice-rep', 'Sales Rep', 'representative', 'MALE', 'en-US', 'google_cloud', 'en-US-Neural2-G', NOW(), NOW());
```

### Fetching Voice Profiles in routes/call.js

```javascript
// routes/call.js - Add database lookup
const db = require('../db'); // Your database module

async function fetchCalleeProfile(callId) {
  // Query database for caller's preferred voice
  const profile = await db.query(
    'SELECT * FROM call_profiles WHERE call_id = ?',
    [callId]
  );
  
  if (profile && profile.preferred_voice_id) {
    return { voiceId: profile.preferred_voice_id };
  }
  
  return null; // Use server defaults
}

// In POST /call handler:
// const profile = await fetchCalleeProfile(callId);
// const voiceId = await resolveVoiceId(req, profile);
```

---

## Monitoring & Alerting

### Prometheus Configuration

Add to your Prometheus scrape config:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'voice-handler'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Grafana Dashboard

Create alerts for:

1. **Error Rate** (alert if >1% errors)
   ```
   rate(call_errors[5m]) / rate(call_total[5m]) > 0.01
   ```

2. **P99 Latency** (alert if >3000ms)
   ```
   histogram_quantile(0.99, tts_generation_ms) > 3000
   ```

3. **Cache Hit Rate** (alert if <80%)
   ```
   rate(tts_cache_hits[5m]) / (rate(tts_cache_hits[5m]) + rate(tts_cache_misses[5m])) < 0.8
   ```

4. **Provider Response Time** (alert if >500ms)
   ```
   histogram_quantile(0.99, provider_response_ms) > 500
   ```

---

## Performance Tuning

### Optimize for Latency

```javascript
// .env configuration for low-latency mode
TTS_TIMEOUT_MS=8000        # Shorter timeout
S3_TIMEOUT_MS=10000        # Faster network assumed
CACHE_ENABLED=true         # Always use cache
USE_STREAMING=true         # Stream audio as available
PRE_SYNTHESIZE_COMMON=true # Pre-cache common phrases
```

### Optimize for Cost

```javascript
// .env configuration for cost optimization
CACHE_TTL_HOURS=336        # 2 weeks (more cache reuse)
USE_CHEAPER_TTS=true       # Use cheaper provider
BATCH_SYNTHESIS=true       # Batch off-peak synthesis
AUDIO_FORMAT=MP3           # Smaller files = less S3 cost
```

### Optimize for Reliability

```javascript
// .env configuration for reliability
TTS_RETRIES=5              # More retries
RETRY_BACKOFF_MS=500       # Longer backoff
CACHE_FALLBACK=true        # Use older cached audio if generation fails
LOG_LEVEL=debug            # Detailed logging for debugging
```

---

## Load Testing

### Simple Load Test

```bash
# Using Apache Bench
ab -n 1000 -c 50 \
  -p request.json \
  -T application/json \
  http://localhost:3001/call

# Using hey (modern ab alternative)
hey -n 1000 -c 50 \
  -H "Content-Type: application/json" \
  -d '{"callId":"test","text":"Hello"}' \
  http://localhost:3001/call
```

### Load Test with Variable Text

```javascript
// load-test.js
const autocannon = require('autocannon');

const instance = autocannon({
  url: 'http://localhost:3001/call',
  connections: 50,
  duration: 30,
  requests: [
    {
      method: 'POST',
      path: '/call',
      headers: { 'Content-Type': 'application/json' },
      body: {
        callId: 'load-test-${counter}',
        text: 'Test message number ${counter}',
        debug: false,
      },
    },
  ],
});

autocannon.track(instance, { renderProgressBar: true });
```

---

## Troubleshooting Common Issues

### Issue: "ECONNREFUSED - Redis Connection Failed"

```bash
# Check Redis is running
redis-cli ping
# Should respond: PONG

# If not running:
redis-server

# Or with Docker:
docker run -d -p 6379:6379 redis:latest
```

### Issue: "AWS S3 Access Denied"

```bash
# Verify credentials
aws s3 ls

# Check IAM permissions for:
# - s3:PutObject
# - s3:GetObject
# - s3:DeleteObject

# Verify bucket exists and region is correct
aws s3api head-bucket --bucket your-bucket --region us-east-1
```

### Issue: "Google Cloud TTS API Key Invalid"

```bash
# Verify credentials file exists
ls -la $GOOGLE_APPLICATION_CREDENTIALS

# Check service account has these roles:
# - Cloud Text-to-Speech API User
# - Service Account User

# Test the API directly:
gcloud text-to-speech synthesize-speech \
  --text="Hello world" \
  --language-code=en-US \
  --ssml-gender=FEMALE
```

### Issue: "Slow Synthesis (>2000ms)"

1. Check Google Cloud quota: https://console.cloud.google.com/apis/dashboard
2. Consider regional endpoint closer to your infrastructure
3. Implement pre-synthesis for common phrases
4. Increase TTS timeout threshold

### Issue: "High Memory Usage"

1. Check histogram size: `MAX_HISTOGRAM_SIZE` in lib/metrics.js
2. Reduce by trimming old entries:
   ```javascript
   // In lib/metrics.js
   MAX_HISTOGRAM_SIZE = 1000; // reduced from 10000
   ```
3. Monitor with: `node --trace-gc server.js`

---

## Production Deployment Checklist

- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Set up alerting for error rate, latency, cache hit rate
- [ ] Enable HTTPS/TLS between services
- [ ] Implement authentication (API key or JWT)
- [ ] Configure rate limiting at API gateway
- [ ] Set up log aggregation (CloudWatch, ELK, DataDog)
- [ ] Test failover scenarios (Redis down, TTS down, S3 down)
- [ ] Configure auto-scaling based on concurrent calls
- [ ] Run load test to determine capacity
- [ ] Document custom voice profiles and phonemes
- [ ] Set up backup for Redis data
- [ ] Document on-call procedures (escalation, rollback)
- [ ] Schedule regular pre-synthesis updates
- [ ] Monitor S3 costs (consider lifecycle policies)

---

## Support & Debugging

### Enable Debug Mode

```bash
# Start with debug logging
LOG_LEVEL=debug npm start

# Or enable debug for single request
curl -X POST "http://localhost:3001/call?debug=true" ...
```

### View Real-Time Metrics

```bash
# Watch metrics as they update
watch -n 1 "curl -s http://localhost:3001/metrics.json | jq '.counters'"

# Or use built-in endpoint
curl http://localhost:3001/metrics.json | jq .
```

### Test Each Component Independently

```javascript
// test-redis.js
const redis = require('ioredis');
const client = new redis(process.env.REDIS_URL);

client.set('test', 'value').then(() => {
  console.log('✓ Redis working');
  process.exit(0);
}).catch(err => {
  console.error('✗ Redis failed:', err);
  process.exit(1);
});
```

```javascript
// test-s3.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const client = new S3Client({ region: process.env.AWS_REGION });

const cmd = new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: 'test-file.txt',
  Body: 'test content',
});

client.send(cmd).then(() => {
  console.log('✓ S3 working');
  process.exit(0);
}).catch(err => {
  console.error('✗ S3 failed:', err);
  process.exit(1);
});
```

