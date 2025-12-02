# WebRTC Debugging Guide

## Overview
This guide covers common WebRTC issues in the CallHub chat system, including getUserMedia errors, ICE connection failures, and TURN server configuration.

## Quick Test: Check Mic Permission

A "Test mic" button is available in the CallComponent pre-call UI. It will:
1. Request microphone permission (browsers may show a system prompt)
2. Log permission grant or error to console
3. Display an alert with the result

**How to use:**
```
1. Open the call screen
2. Click "Test mic" before starting a call
3. Check browser console (F12 > Console tab) for detailed logs
```

## Common Errors & Fixes

### 1. NotAllowedError: Permission Denied
**Cause:** User denied microphone access or browser blocked it.

**Logs to check:**
```
[WebRTC] Requesting microphone permission...
[WebRTC] getUserMedia error: NotAllowedError: Permission denied
```

**Fix:**
- Ensure HTTPS is used (required for getUserMedia)
- Click "Allow" in the browser permission prompt
- Check browser security settings (some browsers require "always allow" for specific sites)
- Try a different browser (Chrome/Edge generally more permissive)

### 2. NotFoundError: No Device Available
**Cause:** System has no audio input device or it's disabled.

**Logs to check:**
```
[WebRTC] getUserMedia error: NotFoundError: Could not find device
```

**Fix:**
- Check that a microphone is plugged in (or built-in mic is enabled)
- Open system audio settings and verify device is not disabled
- Restart browser to refresh device list

### 3. NetworkingError: ICE Connection Failed
**Cause:** STUN/TURN server unreachable or NAT blocking peer connection.

**Logs to check:**
```
[WebRTC] ICE state change: failed
[WebRTC] ICE candidate error: (network error)
[WebRTC] Connection state: failed
```

**Why TURN is needed:**
- STUN allows peers behind simple NAT to discover their public IP
- TURN relays media if peers cannot connect directly (restrictive firewalls, double NAT, corporate networks)
- Without TURN, ~10% of connections fail in restrictive networks

**How to configure TURN:**

**Option A: Use a public TURN server (testing only)**
```typescript
// In CallComponent.tsx, updatePeerConnectionConfig():
const config: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    { urls: ['stun:stun1.l.google.com:19302'] },
    {
      urls: ['turn:openrelay.metered.ca:80'],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};
```

**Option B: Self-hosted TURN server (production)**
Using COTURN (simple, widely-used):
```bash
# Install COTURN
sudo apt-get install coturn

# Edit /etc/coturn/turnserver.conf
realm=example.com
server-name=turn.example.com
listening-port=3478
listening-ip=0.0.0.0
relay-ip=YOUR_PUBLIC_IP
external-ip=YOUR_PUBLIC_IP/YOUR_INTERNAL_IP
user=callhub:mysecurepassword

# Start service
sudo systemctl start coturn
```

Then update config:
```typescript
const config: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    {
      urls: ['turn:turn.example.com:3478'],
      username: 'callhub',
      credential: 'mysecurepassword',
    },
  ],
};
```

### 4. Timeout: Waiting for Media Stream
**Cause:** getUserMedia hangs (system unresponsive, permission dialog not dismissed).

**Logs to check:**
```
[WebRTC] Requesting microphone permission... (no follow-up log after 10s)
```

**Fix:**
- Click "Test mic" to manually grant permissions first
- Reload page and try again
- Check system resource usage (stop other apps)

## Inspecting Logs in Browser Console

**Open DevTools:**
- Chrome/Edge: `F12` or `Ctrl+Shift+I`
- Firefox: `F12` or `Ctrl+Shift+I`
- Safari: `Cmd+Option+I`

**Filter for WebRTC logs:**
```
Ctrl+F in Console tab, search: [WebRTC]
```

**Example output:**
```
[WebRTC] Requesting microphone permission...
[WebRTC] getUserMedia success, tracks: AudioTrack
[WebRTC] RTCPeerConnection config: { iceServers: [...] }
[WebRTC] Offer created, SDP length: 1234
[WebRTC] ICE candidate: candidate:123456 1 udp 2122260223 192.168.1.100 54321 typ host
[WebRTC] Connection state: connected
[WebRTC] Remote stream attached: 1 audio track(s)
```

## Testing Peer Connection Without TURN

To test if TURN is needed in your network:

**Step 1:** Run call without TURN (STUN only)
```typescript
const config = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
};
```

**Step 2:** Check ICE candidates gathered
- If both peers get `host` candidates -> direct connection likely works
- If peers only get `srflx` (server reflexive) candidates -> may need TURN
- If no ICE candidates appear -> definitely need TURN

**Step 3:** Monitor ICE state
- `checking` -> attempting connections
- `connected` -> at least one candidate worked
- `failed` -> no candidates worked, need TURN

## Integration with CallComponent

The CallComponent includes:
- **Verbose logging** for getUserMedia, offer/answer, ICE, and connection state
- **Test mic button** for pre-call permission check
- **Connection error modal** that displays:
  - Error message
  - "Test mic" button to diagnose
  - "Close" button to dismiss
- **Speaker availability check** (requires remote stream attached)

**Usage:**
```tsx
<CallComponent
  callerId={userId}
  calleeId={otherUserId}
  onCallConnected={handleCallConnect}
  onHangup={handleHangup}
/>
```

## Advanced: Custom TURN Discovery

For dynamic TURN server selection (e.g., based on user region):

```typescript
// Fetch TURN credentials from your backend
const turnConfig = await fetch('/api/turn-credentials').then(r => r.json());
// { username: '...', credential: '...', urls: ['turn:...'] }

const config: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    turnConfig, // Dynamic TURN
  ],
};
```

## Testing Checklist

- [ ] Test with headphones plugged in
- [ ] Test in same network (STUN only should work)
- [ ] Test across different networks (may need TURN)
- [ ] Test on 4G/LTE (very likely needs TURN)
- [ ] Test with browser console visible (check logs)
- [ ] Test with corporate firewall (most restrictive -> always needs TURN)

## Next Steps

If issues persist:
1. Collect logs from browser console (copy & paste into issue)
2. Note your network (home wifi, corporate, 4G, etc.)
3. Test with a public TURN server first (for proof of concept)
4. Deploy self-hosted TURN for production
