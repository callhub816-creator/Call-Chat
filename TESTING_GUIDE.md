# Quick Testing Guide - WhatsApp-Style Features

## 🚀 Quick Start

### 1. **Hinglish Chat Testing**

**Test Case 1: Simple Greeting Excluded**
- Send: `Hey`
- Expected: Persona responds in Hinglish (not treating "Hey" as English-only)
- Example: "Hey! Kaise ho aaj?"

**Test Case 2: Devanagari Script Detection**
- Send: `नमस्ते, मैं कैसे हूं?`
- Expected: Response in Hindi/Hinglish
- Example: "नमस्ते! मैं बिलकुल ठीक हूँ।"

**Test Case 3: Tamil Script Detection**
- Send: `வணக்கம், நீ எப்படி இருக்கிறாய்?`
- Expected: Response in Tamil with English/Hindi mix
- Example: "வணக்கம்! நான் சரியாக இருக்கிறேன்..."

**Test Case 4: Mixed Hinglish**
- Send: `Haan, main tumse baat karna chahta hoon`
- Expected: Response in Hinglish
- Example: "Bilkul! Batao, tu kaise hai?"

**Test Case 5: Pure English**
- Send: `Good morning, how are you?`
- Expected: Response in English (or Hinglish if system message directs)
- Example: "Good morning! I'm doing great, thank you!"

---

### 2. **Message Selection & Delete Testing**

**Test Case 1: Long-Press Selection**
1. Send 3-5 messages to persona
2. Long-press on one message
3. Expected: Checkbox appears, selection mode activates
4. Checkbox should be purple (`border-[#B28DFF]`)

**Test Case 2: Multiple Selection**
1. With selection mode active, click multiple messages
2. Delete button appears near phone button showing count
3. Expected: Button shows "🗑️ Delete (3)" or similar

**Test Case 3: Delete Operation**
1. Select 2-3 messages
2. Click delete button
3. Expected: Messages removed from UI immediately
4. Close and reopen chat
5. Expected: Deleted messages stay deleted (storage persisted)

**Test Case 4: Exit Selection Mode**
1. Select messages and deselect the last one
2. Expected: Selection mode exits automatically
3. Delete button disappears

---

### 3. **Call Timer & Avatar Testing**

**Test Case 1: Call Timer Start**
1. Click phone button during chat
2. Wait for connection (should show "Connecting...")
3. When "Connected" status appears
4. Expected: Timer shows "0:00" and starts incrementing
5. Wait 2 minutes
6. Expected: Timer shows "2:00", "2:01", "2:02", etc.

**Test Case 2: Timer Format**
1. Make call and let it run for 1+ hour (or test manually)
2. Expected at 1 minute: "1:00"
3. Expected at 10 minutes: "10:00"
4. Expected at 1 hour: "1:00:00" (HH:MM:SS)
5. Expected at 1:05:30: "1:05:30"

**Test Case 3: Avatar Display**
1. Click call button for persona with avatar
2. When connected, check avatar circle
3. Expected: Persona's profile photo appears in circle
4. Photo should be `w-full h-full object-cover` (fills circle)

**Test Case 4: Avatar Fallback**
1. For persona without avatar (avatarUrl = undefined)
2. When connected, check avatar circle
3. Expected: Gray User icon appears as fallback
4. Icon should be centered and semi-transparent

**Test Case 5: Background Call (Optional)**
1. Start call with persona
2. While call is connected, click phone button to minimize
3. Close the phone call panel
4. Click phone button again to reopen
5. Expected: Call is still connected, timer continued running
6. Expected: Timer shows actual elapsed time (not reset)

---

### 4. **Integration Testing - All Features Together**

**Scenario: Complete User Flow**

1. **Start Chat**
   - Click on persona card
   - Chat screen opens with message input

2. **Test Hinglish**
   - Send: "Hello, kaise ho?"
   - Verify: Response is in Hinglish

3. **Test Message Reply**
   - Long-press on persona's message (should see reply context)
   - Expected: Quoted reply appears at bottom with sender preview

4. **Test Message Delete**
   - Long-press on your own message
   - Expected: Checkbox appears (separate from reply selection)
   - Click another message to select multiple
   - Click red delete button near phone
   - Verify: Messages deleted from storage (close/reopen chat)

5. **Test Call Timer & Avatar**
   - Click phone button
   - Wait for "Connected" status
   - Verify: Timer shows "0:00" and increments
   - Verify: Avatar displays persona's photo
   - Let call run for 30+ seconds
   - Verify: Timer accurately shows elapsed time
   - End call
   - Verify: Timer stops

---

## 🔍 Debugging Checklist

If features aren't working, check:

### Hinglish Not Working?
- [ ] Open DevTools Console
- [ ] Send message with Hindi: `console.log(detectLanguage("नमस्ते"))`
- [ ] Should return `"hinglish"`
- [ ] Check constants.ts has LANGUAGE_CONTROL_SYSTEM_MESSAGE with 7 rules
- [ ] Check detectLanguage.ts has 8 script ranges

### Message Selection Not Appearing?
- [ ] Verify long-press is working (should feel like holding click for 500ms)
- [ ] Check ChatScreen.tsx has selectedMessages state
- [ ] Open DevTools → Elements → Find message div
- [ ] Should have `cursor: pointer` when hovering in selection mode
- [ ] Checkbox should render when `isSelectionMode === true`

### Delete Button Not Showing?
- [ ] Verify selection mode is active
- [ ] Check ChatScreen.tsx line ~500 for delete button render logic
- [ ] Button shows only when: `isSelectionMode && selectedMessages.size > 0`
- [ ] Check storage.saveMessages is being called

### Timer Not Running?
- [ ] Check connection status is "Connected" (not "Connecting")
- [ ] Open DevTools Console → search for "LiveVoiceCall"
- [ ] Check useEffect is running (look for interval logs)
- [ ] Verify formatTime function returns MM:SS format
- [ ] Check callStartTimeRef is being set in onopen callback

### Avatar Not Showing?
- [ ] Check avatarUrl is passed from ChatScreen to LiveVoiceCall
- [ ] Verify avatar image URL is valid (test in browser)
- [ ] Check img element has `object-cover` class
- [ ] Fallback: should show User icon if avatarUrl is undefined
- [ ] Check App.tsx is tracking both persona and avatarUrl during calls

---

## 📊 Test Results Template

```
=== FEATURE TESTING RESULTS ===

Date: [DATE]
Tester: [NAME]

✓ Hinglish Detection
  - Greeting exclusion: [PASS/FAIL]
  - Devanagari detection: [PASS/FAIL]
  - Tamil detection: [PASS/FAIL]
  - Mixed Hinglish: [PASS/FAIL]

✓ Message Selection & Delete
  - Long-press activation: [PASS/FAIL]
  - Multiple selection: [PASS/FAIL]
  - Delete operation: [PASS/FAIL]
  - Storage persistence: [PASS/FAIL]

✓ Call Timer & Avatar
  - Timer starts on connection: [PASS/FAIL]
  - Timer format (MM:SS): [PASS/FAIL]
  - Timer increments correctly: [PASS/FAIL]
  - Avatar displays: [PASS/FAIL]
  - Avatar fallback: [PASS/FAIL]

✓ Integration
  - Complete flow works: [PASS/FAIL]
  - No console errors: [PASS/FAIL]
  - No performance issues: [PASS/FAIL]

Notes:
[ADD OBSERVATIONS HERE]
```

---

## ⚠️ Known Issues & Workarounds

### Issue 1: Timer shows 0:00 for a few seconds
**Cause**: Connection delay between message and audio stream start  
**Workaround**: Wait 1-2 seconds after "Connected" appears for timer to start

### Issue 2: Avatar sometimes shows broken image
**Cause**: Slow network or invalid image URL  
**Workaround**: Ensure persona has valid avatarUrl; check network tab in DevTools

### Issue 3: Delete button doesn't appear in selection mode
**Cause**: State not updating properly  
**Workaround**: Refresh page and try again; check browser console for errors

### Issue 4: Hinglish response is in English despite Hindi message
**Cause**: AI model defaulting to English  
**Workaround**: Add more specific instructions in LANGUAGE_CONTROL_SYSTEM_MESSAGE

---

## 📝 Reporting Bugs

When reporting issues, include:
1. **Feature**: Which feature (Hinglish/Delete/Timer/Avatar)
2. **Steps**: Exact steps to reproduce
3. **Expected**: What should happen
4. **Actual**: What actually happens
5. **Browser**: Chrome/Firefox/Safari/Edge
6. **Console Errors**: Copy from DevTools Console
7. **Screenshots**: If UI-related

---

**Last Updated**: [Current Session]  
**Ready for QA**: Yes
