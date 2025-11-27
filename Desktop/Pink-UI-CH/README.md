<div align="center">

# 💬 CallHub Chat - AI Companions + Guest Chat System

**Complete real-time chat platform with AI personalities and anonymous guest chatting with keyword tagging**

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](.)
[![Node.js](https://img.shields.io/badge/Node.js-v22.20.0-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

[Quick Start](#-quick-start) • [Features](#-features) • [Setup](#-setup) • [API Docs](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 🎯 Features

### 💑 AI Companion Chat
- **10+ Pre-built Personas** - Choose from Myra, Aarav, Anjali, and more
- **Create Custom Partners** - Build your own AI companions
- **Smart Chat** - Real-time messaging with Google Gemini integration
- **Voice Calls** - Simulated voice call experience
- **Language Support** - Default Hinglish with auto-detection
- **Message History** - 7-day local storage with TTL
- **Mode-Locking** - Safety features and content control

### 🔥 Guest Chat System (NEW!)
- ✅ **No Signup Required** - Instant anonymous access
- ✅ **UUID-Based Sessions** - Unique guest ID per visitor
- ✅ **Real-Time Messaging** - Socket.IO powered
- ✅ **Keyword Tagging** - Auto-detection of 60+ keywords
- ✅ **Unlimited Messages** - No rate limiting on chats
- ✅ **Search & Filter** - Find messages by keywords
- ✅ **Responsive Design** - Desktop, tablet, mobile friendly
- ✅ **REST + WebSocket** - Multiple API options

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ (tested on v22.20.0)
- **npm** or **yarn**

### 1. Clone & Install
```bash
# Install dependencies
npm install

# Install backend packages (already in package.json)
npm install express socket.io socket.io-client uuid cors
```

### 2. Configure Environment
Create `.env.local`:
```env
# Required for AI Chat
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Guest Chat Server (optional, defaults to localhost:3001)
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Start Both Services

**Terminal 1 - Frontend:**
```bash
npm run dev
```
📍 Opens at http://localhost:5173

**Terminal 2 - Guest Chat Server (Optional):**
```bash
npm run server:dev
```
📍 Server at http://localhost:3001

### 4. Try Guest Chat
1. Visit http://localhost:5173
2. Click **"Guest Chat"** button
3. Start chatting anonymously!

---

## 📁 Project Structure

```
.
├── 📄 App.tsx                          # Main app shell + routing
├── 📄 GuestChat.tsx                    # Guest chat component
│
├── 📁 server/                          # Backend - Express + Socket.IO
│   ├── index.js                        # Server entry point
│   ├── middleware/
│   │   └── keywordTagger.js            # Keyword extraction logic
│   └── config/
│       └── keywords.txt                # Configurable keywords
│
├── 📁 components/                      # React components
│   ├── ChatScreen.tsx                  # AI chat interface
│   ├── PersonaCard.tsx                 # Character card (unified style)
│   ├── ProfileCard.tsx                 # Guest profile sidebar
│   ├── PersonaGallery.tsx              # Browse characters
│   ├── CardGallery.tsx                 # Create custom AI
│   ├── LiveVoiceCall.tsx               # Voice call simulation
│   ├── PersonaProfileModal.tsx         # Character profile view
│   └── ...6 more pages                 # About, Privacy, Terms, FAQ, Safety, Admin
│
├── 📁 public/personas/                 # Avatar images for AI personas
│   ├── aarav.jpg
│   ├── anjali.jpg
│   ├── myra.jpg
│   └── ...more
│
├── 📁 utils/                           # Utilities
│   ├── storage.ts                      # LocalStorage wrapper (7-day TTL)
│   └── placeholder.ts
│
├── 📁 src/                             # Additional source files
│   ├── GuestChat.tsx                   # (Copy in root)
│   └── components/
│
├── constants.ts                        # System personas config
├── types.ts                            # TypeScript interfaces
├── index.tsx                           # React entry point
├── index.css                           # Global styles
├── vite.config.ts                      # Vite configuration
├── tsconfig.json                       # TypeScript config
└── package.json                        # Dependencies
```

---

## 🔧 Configuration

### Guest Chat Keywords
Edit `server/config/keywords.txt` - one keyword per line:
```
love
heartbreak
relationship
trust
romantic
...
```

### Server Settings
Edit `server/index.js`:
```javascript
// Line 21: Max messages to store in memory
const MAX_MESSAGES = 500;

// Line 22: Character limit per message
const MAX_MESSAGE_LENGTH = 3000;

// Line 24-25: Spam protection
const SPAM_THRESHOLD = 3;           // max messages
const SPAM_WINDOW = 5000;           // time window in ms

// Line 29: Server port
const PORT = process.env.PORT || 3001;
```

### Customize Personas
Edit `constants.ts`:
```typescript
{
  id: 'myra',
  name: 'Myra',
  personality: '...',
  avatarUrl: '/personas/myra.jpg',
  defaultLanguage: 'hinglish'
}
```

---

## 🔌 API Reference

### REST Endpoints

All endpoints available at `http://localhost:3001/api`

#### Health Check
```bash
GET /api/health
```
Response:
```json
{
  "status": "ok",
  "activeUsers": 5,
  "totalMessages": 42,
  "timestamp": "2025-11-27T12:00:00.000Z"
}
```

#### Send Message
```bash
POST /api/message
Content-Type: application/json

{
  "guestId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Hello! This is romantic",
  "userName": "Guest User"
}
```

Response:
```json
{
  "id": "msg-uuid",
  "guestId": "guest-uuid",
  "message": "Hello! This is romantic",
  "userName": "Guest User",
  "tags": ["romantic", "hello"],
  "timestamp": "2025-11-27T12:00:00.000Z",
  "source": "rest"
}
```

#### Get All Messages
```bash
GET /api/messages
```

#### Search Messages
```bash
GET /api/messages/search?q=love
```

#### Clear Messages (Admin)
```bash
DELETE /api/messages
```

### Socket.IO Events

#### Client → Server
```javascript
// Send message via Socket.IO
socket.emit('send_message', {
  message: "What are you thinking about?",
  userName: "John Doe"
});

// Typing indicator
socket.emit('typing', { userName: "John" });
socket.emit('stop_typing', {});
```

#### Server → Client
```javascript
// Receive your guest ID
socket.on('guest_id', (data) => {
  console.log(data.guestId);
});

// Load initial messages
socket.on('load_messages', (data) => {
  console.log(data.messages); // Last 50
});

// New message arrives
socket.on('new_message', (message) => {
  // { id, guestId, userName, message, tags[], timestamp, source }
});

// User count
socket.on('user_count', (data) => {
  console.log(data.activeUsers);
});

// Error
socket.on('error', (data) => {
  console.error(data.message);
});
```

---

## 🎨 UI Features

### GuestChat Component
**File:** `GuestChat.tsx` (361 lines, fully typed)

**Layout:**
```
┌─────────────────┬──────────────────────┬──────────────┐
│                 │                      │              │
│  Profile Card   │   Chat Messages      │   Activity   │
│  • Avatar       │   • Message bubbles  │   • Online #  │
│  • Guest ID     │   • Keyword pills    │   • Messages  │
│  • Status       │   • Timestamps       │   • Session   │
│  • Features     │   • Input form       │   • Info      │
│  • Exit Button  │                      │              │
└─────────────────┴──────────────────────┴──────────────┘
```

**Features:**
- Real-time message sync via Socket.IO
- Auto-scroll to latest message
- Keyword detection & display as pills
- Character counter (3000 char limit)
- Error handling with alerts
- Typing indicators
- Responsive breakpoints (hidden on mobile)

### ProfileCard Component
**File:** `components/ProfileCard.tsx` (97 lines, typed)

**Shows:**
- Gradient avatar with User icon
- Guest ID (truncated, copyable)
- Online status with pulse animation
- Connection timestamp
- About section
- Feature list (bullets)
- Exit Chat button with logout

---

## 🧪 Testing

### Test Server Health
```bash
curl http://localhost:3001/api/health
```

### Test Message Sending
```bash
curl -X POST http://localhost:3001/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "test-user-123",
    "message": "I love this romantic system",
    "userName": "Test User"
  }'
```

### Test Socket.IO (Browser Console)
```javascript
const socket = io('http://localhost:3001');

socket.on('guest_id', (data) => {
  console.log('✅ Connected as:', data.guestId);
  
  // Send a test message
  socket.emit('send_message', {
    message: 'Hi everyone! Testing keyword tagging.',
    userName: 'Console User'
  });
});

socket.on('new_message', (msg) => {
  console.log('📨 New message:', msg);
  console.log('🏷️ Tags:', msg.tags);
});
```

---

## 🚀 Build for Production

### Frontend Build
```bash
npm run build
```
Generates optimized bundle in `dist/`

### Run Production Build Locally
```bash
npm run preview
```

### Deploy Frontend

**Vercel:**
```bash
npm install -g vercel
npm run build
vercel deploy
```

**Netlify:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
npm run build
# Follow GitHub Pages deployment guide
```

### Deploy Backend

**Option 1: Heroku**
```bash
heroku login
heroku create your-app-name
git push heroku main
# Backend runs at https://your-app-name.herokuapp.com
```

**Option 2: Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 3001
CMD ["npm", "run", "server"]
```

Build & run:
```bash
docker build -t guest-chat .
docker run -p 3001:3001 guest-chat
```

**Option 3: VPS (Ubuntu/Linux)**
```bash
# SSH into your server
ssh user@your-vps

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone & setup
git clone https://github.com/your-repo
cd your-repo
npm install

# Use PM2 for auto-restart
sudo npm install -g pm2
pm2 start server/index.js --name "guest-chat"
pm2 startup
pm2 save
pm2 logs
```

---

## 📊 How Keyword Tagging Works

### Process
1. **Load** - Server reads `server/config/keywords.txt` on startup
2. **Normalize** - Keywords converted to lowercase
3. **Extract** - On message arrival, regex with word boundaries matches keywords
4. **Tag** - Matched keywords added to `message.tags` array
5. **Display** - Frontend shows keywords as styled pills

### Example
```
Message: "I am so in love and feeling romantic about my partner"

Loaded Keywords: [...love, romantic, partner, trust...]

Regex Matching:
  ✓ \blove\b     → Found
  ✓ \bromantic\b → Found
  ✓ \bpartner\b  → Found

Result:
{
  "message": "I am so in love...",
  "tags": ["love", "romantic", "partner"]
}

UI Display:
"I am so in love and feeling romantic about my partner
  🏷️ 3 keywords detected
  #love #romantic #partner"
```

### Customization
Edit `server/config/keywords.txt`:
```
# One keyword per line
love
romance
heartbreak
commitment
trust
family
... etc
```

---

## 🔒 Security Features

### Implemented
✅ CORS protection  
✅ Rate limiting (spam protection: 3 messages/5s)  
✅ Input validation (3000 char max)  
✅ XSS prevention via React  
✅ UUID-based anonymous sessions  

### Recommended for Production
- Add user authentication (JWT)
- Use database (PostgreSQL/MongoDB) instead of in-memory
- Add HTTPS/TLS encryption
- Implement proper CORS whitelist
- Add content moderation
- Add DDoS protection
- Message encryption (E2E)
- SQL injection prevention (if using DB)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

### Socket.IO Connection Fails
```
Check:
✓ Server is running: npm run server:dev
✓ VITE_SOCKET_URL in .env.local is correct
✓ CORS enabled in server/index.js
✓ No firewall blocking port 3001
✓ Browser console for specific error
```

### Keywords Not Detected
```
Check:
✓ server/config/keywords.txt exists
✓ Keywords are lowercase
✓ One keyword per line, no extra spaces
✓ Server restarted after changes
✓ Keyword regex is correct in keywordTagger.js
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Messages Disappearing
Remember: In-memory storage means messages are lost on server restart!

---

## 📝 Git & Version Control

**Current Branch:** `feature/guest-chat-keyword-system`

### Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### Create Pull Request
```bash
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature
# Open PR on GitHub
```

---

## 🗂️ File Reference

| File | Purpose | Lines |
|------|---------|-------|
| `server/index.js` | Express + Socket.IO server | 338 |
| `server/middleware/keywordTagger.js` | Keyword extraction logic | 60 |
| `GuestChat.tsx` | Main guest chat UI component | 375 |
| `components/ProfileCard.tsx` | User profile sidebar | 97 |
| `App.tsx` | Main app with routing | 253 |
| `constants.ts` | System personas configuration | ~400 |
| `types.ts` | TypeScript interfaces | ~50 |
| `index.tsx` | React entry point | ~30 |

**Total Lines of Code:** ~2500+

---

## 🎯 Roadmap

- [x] Guest chat system
- [x] Keyword tagging
- [x] Real-time messaging
- [ ] Database integration (PostgreSQL)
- [ ] User authentication (JWT)
- [ ] Private messaging
- [ ] Message reactions/emojis
- [ ] User avatars
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Video chat integration
- [ ] File sharing
- [ ] Message encryption
- [ ] Moderation tools

---

## 📞 Support & Resources

**Documentation:**
- [Guest Chat Complete Setup Guide](./GUEST_CHAT_SETUP.md)
- [API Reference](./GUEST_CHAT_SETUP.md#-api-reference)
- [Socket.IO Events](./GUEST_CHAT_SETUP.md#-socketio-events)
- [Deployment Guide](./GUEST_CHAT_SETUP.md#-deployment)

**Troubleshooting:**
- [Troubleshooting Guide](./GUEST_CHAT_SETUP.md#-troubleshooting)
- [Security Notes](./GUEST_CHAT_SETUP.md#-security-notes)

---

## 📄 License

MIT © 2025

---

<div align="center">

**Made with ❤️ for modern, real-time chat experiences**

[⬆ Back to Top](#callhub-chat---ai-companions--guest-chat-system)

</div>
