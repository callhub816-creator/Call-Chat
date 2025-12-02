#!/usr/bin/env node

/**
 * QUICK_REFERENCE.md - One-Page Quick Reference
 * 
 * Copy-paste ready commands and configurations for rapid deployment.
 */

# Quick Reference Guide

## 🚀 30-Second Start

```bash
# 1. Install
cd server && npm install

# 2. Configure (local dev with mock providers)
cat > .env << 'EOF'
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
TTS_PROVIDER=mock
PROVIDER_TYPE=mock
PORT=3001
EOF

# 3. Start Redis (Docker)
docker run -d -p 6379:6379 redis:latest

# 4. Run server
npm start

# 5. Test
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{"callId":"test-1","text":"Hello world"}'
```

---

## 📁 File Structure

```
server/
├── lib/
│   ├── cache.js          # Redis wrapper
│   ├── storage.js        # S3 upload
│   ├── ttsAdapter.js     # TTS provider
│   ├── provider.js       # Telephony adapter
│   ├── metrics.js        # Prometheus metrics
│   ├── retry.js          # Exponential backoff
│   └── logger.js         # Logging
├── routes/
│   └── call.js           # Main handler (POST /call)
├── scripts/
│   └── presynthesize.js  # Batch TTS
├── tests/
│   └── e2e.js            # E2E tests
├── config/
│   ├── phrases.json      # Common phrases
│   └── voices.json       # Voice profiles
├── examples/
│   └── client.js         # Example client
├── server.js             # Express setup
├── package.json          # Dependencies
├── .env.example          # Environment template
├── API.md                # API specification
├── README.md             # Full documentation
├── QUICKSTART.md         # 5-min setup
├── INTEGRATION.md        # Integration patterns
├── IMPLEMENTATION.md     # Design decisions
└── MANIFEST.md           # This summary
```

---

## 🔧 Configuration Reference

### Essential Variables

```bash
# Redis
REDIS_URL=redis://localhost:6379

# AWS S3 (for production)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1

# Google Cloud TTS (for production)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# Timeouts
TTS_TIMEOUT_MS=10000
S3_TIMEOUT_MS=30000

# Retry
RETRY_ATTEMPTS=3
RETRY_INITIAL_DELAY_MS=100

# Logging
LOG_LEVEL=info  # error, warn, info, debug

# Development
PORT=3001
NODE_ENV=development
```

### Feature Flags

```bash
# Enable/disable features
CACHE_ENABLED=true
USE_STREAMING=false
USE_CHEAPER_TTS=false

# Cache TTL (hours)
CACHE_TTL_HOURS=168  # 7 days
```

---

## 📊 API Quick Reference

### POST /call (Main Endpoint)

```bash
# Basic request
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{"callId":"call-001","text":"Hello"}'

# With debug timing
curl -X POST "http://localhost:3001/call?debug=true" \
  -H "Content-Type: application/json" \
  -d '{"callId":"call-001","text":"Hello"}'

# With format specification
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{"callId":"call-001","text":"Hello","format":"LINEAR16"}'

# Response (success)
{
  "success": true,
  "audioUrl": "https://s3.../audio.mp3",
  "cached": false,
  "timings": {...}
}

# Response (error)
{
  "success": false,
  "error": "TTS timeout"
}
```

### GET /health (Status Check)

```bash
curl http://localhost:3001/health
# Response: 200 OK
# { "status": "healthy", "checks": {...} }
```

### GET /metrics (Prometheus Format)

```bash
curl http://localhost:3001/metrics
# Prometheus-compatible output for Prometheus scraping
```

### GET /metrics.json (JSON Format)

```bash
curl http://localhost:3001/metrics.json | jq .
# {
#   "counters": {"call_total": 123, ...},
#   "histograms": {...}
# }
```

---

## 🧪 Testing Commands

### Health Check
```bash
npm run health  # Or:
curl http://localhost:3001/health
```

### Run E2E Tests
```bash
npm test  # Requires server running on :3001
# Output: X/5 tests passed
```

### Test Cache Hit vs Miss
```bash
# First call (cache miss) - ~1800ms
curl -X POST "http://localhost:3001/call?debug=true" \
  -H "Content-Type: application/json" \
  -d '{"callId":"cache-test","text":"Test message"}'

# Second call (cache hit) - ~30ms
curl -X POST "http://localhost:3001/call?debug=true" \
  -H "Content-Type: application/json" \
  -d '{"callId":"cache-test-2","text":"Test message"}'
```

### Pre-synthesize Common Phrases
```bash
npm run presynthesize
# Synthesizes all phrases in config/phrases.json
# Uploads to S3 and caches in Redis
```

### Load Testing
```bash
# Using ab (Apache Bench)
ab -n 1000 -c 50 -p request.json -T application/json http://localhost:3001/call

# Using hey
hey -n 1000 -c 50 -H "Content-Type: application/json" \
  -d '{"callId":"load-test","text":"Hello"}' \
  http://localhost:3001/call
```

---

## 🐛 Troubleshooting Checklist

### Server Won't Start

```bash
# 1. Check Node version
node --version  # Should be >=16

# 2. Check dependencies installed
npm ls

# 3. Check .env file exists
ls -la .env

# 4. Check Redis is running
redis-cli ping  # Should reply: PONG
```

### Redis Connection Failed

```bash
# Start Redis (Docker)
docker run -d -p 6379:6379 redis:latest

# Or local Redis
redis-server

# Test connection
redis-cli ping
```

### TTS Synthesis Fails

```bash
# For mock (testing):
# Already working, no setup needed

# For Google Cloud (production):
# 1. Create GCP service account
# 2. Download JSON key
# 3. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
# 4. Test: gcloud text-to-speech synthesize-speech --text="Hello" --language-code=en-US
```

### S3 Upload Fails

```bash
# 1. Check AWS credentials
aws s3 ls

# 2. Check bucket exists
aws s3api head-bucket --bucket your-bucket

# 3. Check IAM permissions
# Required: s3:PutObject, s3:GetObject, s3:DeleteObject

# 4. Check region
# AWS_REGION env var should match bucket region
```

### Slow Response (>2000ms)

```bash
# 1. Check cache hit rate
curl http://localhost:3001/metrics.json | jq '.counters | {hits: .tts_cache_hits, misses: .tts_cache_misses}'

# 2. If low hit rate, pre-synthesize
npm run presynthesize

# 3. Check TTS latency
curl "http://localhost:3001/call?debug=true" ... | jq '.timings.tts_generation_ms'

# 4. Check S3 latency
curl "http://localhost:3001/call?debug=true" ... | jq '.timings.s3_upload_ms'
```

### High Memory Usage

```bash
# Check histogram size
# Reduce MAX_HISTOGRAM_SIZE in lib/metrics.js from 10000 to 1000

# Monitor GC
node --trace-gc server.js 2>&1 | grep GC
```

---

## 📈 Performance Tuning

### For Low Latency (IVR, Real-time)

```bash
# .env
CACHE_ENABLED=true
TTS_TIMEOUT_MS=8000
S3_TIMEOUT_MS=10000
RETRY_ATTEMPTS=2
LOG_LEVEL=warn
```

Then pre-synthesize common phrases:
```bash
npm run presynthesize
```

### For High Availability (Reliability)

```bash
# .env
RETRY_ATTEMPTS=5
RETRY_INITIAL_DELAY_MS=200
CACHE_FALLBACK=true
LOG_LEVEL=info
```

### For Cost (Batch Processing)

```bash
# .env
CACHE_TTL_HOURS=336  # 2 weeks
BATCH_SYNTHESIS=true
AUDIO_FORMAT=MP3
USE_CHEAPER_TTS=true
```

---

## 🚢 Deployment Commands

### Local Development

```bash
npm install
npm start           # Runs on :3001
npm test            # Run tests
npm run dev         # Debug mode (LOG_LEVEL=debug)
```

### Docker

```bash
# Build
docker build -t voice-handler .

# Run
docker run -e REDIS_URL=redis://host.docker.internal:6379 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-key.json \
  -v /path/to/gcp-key.json:/app/gcp-key.json \
  -p 3001:3001 \
  voice-handler

# Or with docker-compose (includes Redis)
docker-compose up
```

### PM2 (Production)

```bash
npm install -g pm2
pm2 start server.js --name voice-handler
pm2 save
pm2 startup
pm2 logs voice-handler
```

### Kubernetes

```bash
# Create secret for credentials
kubectl create secret generic voice-handler-creds \
  --from-literal=aws-access-key-id=xxx \
  --from-literal=aws-secret-access-key=xxx \
  --from-file=gcp-key.json=/path/to/key.json

# Deploy
kubectl apply -f k8s-deployment.yaml  # See IMPLEMENTATION.md
```

---

## 📚 Documentation Map

| Need | Document | Section |
|------|----------|---------|
| Full overview | README.md | - |
| API endpoints | API.md | Endpoints |
| 5-min setup | QUICKSTART.md | - |
| Integration patterns | INTEGRATION.md | Integration Patterns |
| Design decisions | IMPLEMENTATION.md | Design Decisions |
| Example code | examples/client.js | - |
| This reference | QUICK_REFERENCE.md | - |

---

## 💾 Environment Templates

### Local Development (Mock Everything)

```bash
REDIS_URL=redis://localhost:6379
TTS_PROVIDER=mock
PROVIDER_TYPE=mock
LOG_LEVEL=debug
PORT=3001
CACHE_TTL_HOURS=1
```

### AWS (S3 + Google Cloud TTS)

```bash
REDIS_URL=redis://your-redis-url:6379
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-key.json
TTS_TIMEOUT_MS=10000
RETRY_ATTEMPTS=3
LOG_LEVEL=info
PORT=3001
```

### AWS (S3 + AWS Polly)

```bash
REDIS_URL=redis://your-redis-url:6379
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
TTS_PROVIDER=aws_polly  # (TODO: implement in ttsAdapter.js)
LOG_LEVEL=info
PORT=3001
```

### High-Availability (With Fallbacks)

```bash
REDIS_URL=redis://redis-1:6379,redis://redis-2:6379
AWS_S3_BUCKET=primary-bucket
AWS_S3_BUCKET_FALLBACK=fallback-bucket
TTS_PROVIDER=google_cloud
TTS_PROVIDER_FALLBACK=mock
RETRY_ATTEMPTS=5
CACHE_FALLBACK=true
LOG_LEVEL=warn
```

---

## 🎯 Key Metrics to Monitor

```bash
# Via Prometheus
rate(call_total[5m])              # Calls per second
rate(call_errors[5m])             # Errors per second
rate(tts_cache_hits[5m])          # Cache hit rate
histogram_quantile(0.99, tts_generation_ms)  # P99 latency

# Via JSON endpoint
curl http://localhost:3001/metrics.json | jq '.counters'
curl http://localhost:3001/metrics.json | jq '.histograms.call_total_ms'
```

---

## 🔐 Security Checklist

- [ ] Use HTTPS/TLS in production
- [ ] Store credentials in .env (not in code)
- [ ] Use IAM roles for AWS (not access keys if possible)
- [ ] Implement API key/JWT authentication
- [ ] Enable S3 bucket encryption
- [ ] Set S3 ACL to private (not public-read)
- [ ] Rotate credentials regularly
- [ ] Monitor CloudTrail/audit logs
- [ ] Restrict Redis to private network
- [ ] Use rate limiting at API gateway

---

## 💡 Pro Tips

1. **Cache Speedup**: Pre-synthesize common phrases → 50x faster
2. **Cost Savings**: Increase CACHE_TTL_HOURS → fewer TTS calls
3. **Real-time**: Use streaming mode for long texts
4. **Reliability**: Set RETRY_ATTEMPTS=5 in production
5. **Debugging**: Add ?debug=true to POST /call for timing breakdown
6. **Monitoring**: Scrape /metrics endpoint with Prometheus
7. **Testing**: npm test validates cache + metrics + provider
8. **Load**: Pre-warm Redis with presynthesize script

---

## 📞 Support Matrix

| Issue | Solution | Time |
|-------|----------|------|
| Server won't start | Check .env, Node version | 2 min |
| Redis won't connect | Start redis-server or Docker container | 1 min |
| Slow synthesis | Enable caching, pre-synthesize phrases | 5 min |
| S3 upload fails | Check AWS credentials and IAM permissions | 5 min |
| Tests fail | Ensure server running on :3001 | 1 min |
| High latency | Check cache hit rate, add pre-synthesis | 10 min |

---

## ✅ Ready to Deploy?

Use this checklist:

- [ ] `npm install` completed without errors
- [ ] `.env` configured with real credentials
- [ ] `npm test` passes (5/5 tests)
- [ ] `npm run presynthesize` completes (for common phrases)
- [ ] Manual test passes: `curl -X POST http://localhost:3001/call ...`
- [ ] Metrics endpoint responds: `curl http://localhost:3001/metrics.json`
- [ ] Redis and S3 are production-ready
- [ ] Monitoring configured (Prometheus or CloudWatch)
- [ ] Alerting configured (error rate, latency)
- [ ] Load testing completed
- [ ] Documentation reviewed and customized
- [ ] Team trained on operations

Once all checked: **Ready for production! 🚀**

---

## 🔗 Quick Links

- **GitHub**: (your repo URL)
- **Documentation**: See MANIFEST.md for full index
- **Issues**: (your issue tracker)
- **Support**: (your support channel)

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Status**: Production-Ready ✅

