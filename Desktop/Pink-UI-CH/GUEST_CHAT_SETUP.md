# 🔥 Guest Chat + Keyword Tagging System - Setup Guide

## 📋 What Was Built

A complete **anonymous guest chat system** with real-time messaging and automatic keyword tagging. No signup, no auth, unlimited messages.

### Key Features:
✅ **No Signup Required** - Generate UUID on first visit  
✅ **Real-time Chat** - Socket.IO bidirectional communication  
✅ **Keyword Tagging** - Automatic detection of 60+ keywords  
✅ **Modern UI** - React + Tailwind CSS  
✅ **Backend API** - Express + Node.js  
✅ **Spam Protection** - Rate limiting (3 messages per 5 seconds)  
✅ **Message Limits** - 3000 character max per message  
✅ **In-Memory Store** - Simple array storage (supports 500 recent messages)  

---

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
npm install
```

All required packages are already in `package.json`:
- `express` - Backend server
- `socket.io` - Real-time communication
- `socket.io-client` - Frontend WebSocket client
- `uuid` - Generate guest IDs
- `cors` - Cross-origin requests

### 2. **Start the Backend Server**

**Development mode (with auto-reload):**
```bash
npm run server:dev
```

**Production mode:**
```bash
npm run server
```

The server will start on `http://localhost:3001`

Output:
```
╔════════════════════════════════════════╗
║   🚀 Guest Chat Server Running         ║
╚════════════════════════════════════════╝

  📍 Server: http://localhost:3001
  🔌 Socket.IO: ws://localhost:3001
  
  Routes:
  • GET  /api/health
  • POST /api/message
  • GET  /api/messages
  • GET  /api/messages/search?q=keyword
  • DELETE /api/messages (admin)
  
  ✅ Ready to accept connections!
```

### 3. **Start the Frontend (In another terminal)**

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. **Access Guest Chat**

Click **"Guest Chat"** button on the home page to enter the chat.

---

## 📁 Project Structure

```
.
├── server/                          # Backend server
│   ├── index.js                     # Main Express + Socket.IO server
│   ├── middleware/
│   │   └── keywordTagger.js         # Keyword extraction logic
│   └── config/
│       └── keywords.txt             # List of keywords to tag
│
├── GuestChat.tsx                    # Main guest chat component
├── components/
│   └── ProfileCard.tsx              # User profile sidebar
│
├── App.tsx                          # Main app with routes
├── package.json                     # Dependencies
└── .env.example                     # Environment variables
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` (optional):
```env
# Socket.IO Server URL (default: http://localhost:3001)
VITE_SOCKET_URL=http://localhost:3001

# Gemini API Key (for other features)
VITE_GEMINI_API_KEY=your_key_here
```

### Customize Keywords

Edit `server/config/keywords.txt`:
- One keyword per line
- Case-insensitive matching
- Word boundaries enforced (no partial matches)

Example keywords:
```
love
heartbreak
relationship
dating
trust
...
```

### Server Configuration

Edit `server/index.js` to change:

```javascript
// Line 21: Max messages stored in memory
const MAX_MESSAGES = 500;

// Line 22: Max message length
const MAX_MESSAGE_LENGTH = 3000;

// Line 24-25: Spam limits
const SPAM_THRESHOLD = 3;          // messages per window
const SPAM_WINDOW = 5000;          // window in ms

// Line 29: Server port
const PORT = process.env.PORT || 3001;
```

---

## 🔌 API Reference

### REST Endpoints

#### 1. **Health Check**
```bash
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T12:00:00.000Z",
  "activeUsers": 5,
  "totalMessages": 42
}
```

#### 2. **Send Message**
```bash
POST /api/message
Content-Type: application/json

{
  "guestId": "uuid-string",
  "message": "Hello everyone!",
  "userName": "Anonymous" 
}
```

Response:
```json
{
  "id": "msg-uuid",
  "guestId": "guest-uuid",
  "userName": "Anonymous",
  "message": "Hello everyone!",
  "tags": ["hello"],
  "timestamp": "2025-11-27T12:00:00.000Z",
  "source": "rest"
}
```

#### 3. **Get All Messages**
```bash
GET /api/messages
```

Response:
```json
{
  "total": 42,
  "messages": [...]
}
```

#### 4. **Search Messages**
```bash
GET /api/messages/search?q=love
```

Response:
```json
{
  "query": "love",
  "total": 3,
  "messages": [...]
}
```

#### 5. **Clear All Messages** (Admin)
```bash
DELETE /api/messages
```

---

## 🔌 Socket.IO Events

### Client → Server

**Connect:**
```javascript
// Auto-emitted when client connects
```

**Send Message:**
```javascript
socket.emit('send_message', {
  message: "Hi there!",
  userName: "Optional Name"
});
```

**Typing:**
```javascript
socket.emit('typing', {
  userName: "John"
});
```

**Stop Typing:**
```javascript
socket.emit('stop_typing', {});
```

### Server → Client

**Receive Guest ID:**
```javascript
socket.on('guest_id', (data) => {
  console.log(data.guestId); // Your unique ID
});
```

**Load Initial Messages:**
```javascript
socket.on('load_messages', (data) => {
  console.log(data.messages); // Last 50 messages
});
```

**Receive New Message:**
```javascript
socket.on('new_message', (message) => {
  // {
  //   id, guestId, userName, message,
  //   tags: ['keyword1', 'keyword2'],
  //   timestamp, source
  // }
});
```

**User Count Update:**
```javascript
socket.on('user_count', (data) => {
  console.log(data.activeUsers);
});
```

**Error:**
```javascript
socket.on('error', (data) => {
  console.log(data.message);
});
```

---

## 🎨 UI Components

### GuestChat Component
**File:** `GuestChat.tsx`

**Features:**
- Left sidebar: Profile card with user info & features
- Center: Chat messages with keyword tags
- Right panel: Activity stats & session info
- Message bubbles: Different styles for own vs other messages
- Keyword pills: Display detected keywords under messages
- Real-time typing indicator support

### ProfileCard Component
**File:** `components/ProfileCard.tsx`

**Displays:**
- User avatar with gradient
- Guest ID (truncated)
- Online status indicator
- Connection time
- About text
- Feature list
- Exit Chat button

---

## 🔐 Security Notes

⚠️ **This is a demo system. For production:**

1. **Add Authentication** - Replace UUID with JWT tokens
2. **Use Database** - Replace in-memory storage with PostgreSQL/MongoDB
3. **Rate Limiting** - Add proper DDoS protection
4. **Input Validation** - Sanitize all user inputs
5. **Message Encryption** - Use TLS/SSL for all connections
6. **Keyword Filtering** - Add content moderation
7. **CORS Configuration** - Restrict to your domain

---

## 🧪 Testing

### Test the Server

```bash
# Check if server is running
curl http://localhost:3001/api/health

# Send a test message
curl -X POST http://localhost:3001/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "test-user-123",
    "message": "Hello world!",
    "userName": "Tester"
  }'

# Get all messages
curl http://localhost:3001/api/messages

# Search for keyword
curl "http://localhost:3001/api/messages/search?q=hello"
```

### Test Socket.IO (Browser Console)

```javascript
const socket = io('http://localhost:3001');

socket.on('guest_id', (data) => {
  console.log('My ID:', data.guestId);
  
  // Send a message
  socket.emit('send_message', {
    message: 'Test from console!',
    userName: 'Console User'
  });
});

socket.on('new_message', (msg) => {
  console.log('New message:', msg);
});
```

---

## 📊 Keyword System

### How It Works

1. **Keywords Loaded** - On server start, reads `server/config/keywords.txt`
2. **Extraction** - When message arrives, regex matches keywords with word boundaries
3. **Tagging** - Found keywords added to `message.tags` array
4. **Display** - Frontend shows keywords as pills under message

### Example

Input message:
```
"I am in love and feeling romantic about my partner"
```

Keywords matched:
```
["love", "romantic", "partner"]
```

UI Display:
```
I am in love and feeling romantic about my partner

🏷️ 3 keywords detected
#love #romantic #partner
```

---

## 🚀 Deployment

### Deploy to Vercel (Frontend)
```bash
npm run build
vercel deploy
```

### Deploy Backend

**Option 1: Heroku**
```bash
heroku login
heroku create your-app-name
heroku config:set PORT=3001
git push heroku main
```

**Option 2: Docker**
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "server"]
```

**Option 3: VPS (Ubuntu)**
```bash
# SSH into server
ssh user@your-vps

# Clone repo & install
git clone https://github.com/your-repo
npm install
npm run build

# Use PM2 for auto-restart
npm install -g pm2
pm2 start server/index.js --name "guest-chat"
pm2 save
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

### Socket.IO Connection Error
```
Ensure:
✓ Server is running (npm run server)
✓ VITE_SOCKET_URL is correct in .env
✓ CORS is enabled in server/index.js
✓ Firewall allows port 3001
```

### Keywords Not Detected
```
Check:
✓ server/config/keywords.txt exists
✓ Keywords are lowercase
✓ One keyword per line
✓ Server was restarted after changes
```

### Messages Not Persisting
```
Remember:
• Messages are stored in-memory only
• Restarting server clears all messages
• Max 500 messages stored
• Messages expire on server restart
```

---

## 📝 Git Workflow

This feature was created on branch: `feature/guest-chat-keyword-system`

### To merge into main:
```bash
git checkout main
git merge feature/guest-chat-keyword-system
git push origin main
```

### To continue development:
```bash
git checkout feature/guest-chat-keyword-system
git pull origin feature/guest-chat-keyword-system
```

---

## 🎯 Next Steps / Enhancements

- [ ] Add database (PostgreSQL/MongoDB)
- [ ] Implement user authentication
- [ ] Add message reactions/emojis
- [ ] Private messages between users
- [ ] Message search with filters
- [ ] User profiles with avatars
- [ ] Admin moderation panel
- [ ] Rate limiting per IP
- [ ] Message encryption
- [ ] Video/voice calling
- [ ] File sharing
- [ ] Message history export
- [ ] Analytics dashboard

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check browser console for errors
4. Check server logs for backend issues

---

**Built with ❤️ - Production-ready, paste & run quality**
