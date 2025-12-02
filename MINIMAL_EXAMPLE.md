/**
 * MINIMAL EXAMPLE - Message Selection Feature
 * 
 * This shows a simplified example of how the feature works.
 * See CHATSCREEN_PATCH.md for the full ChatScreen.tsx integration.
 */

// ============================================================================
// MINIMAL EXAMPLE: Extract from ChatScreen.tsx
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useSelection } from '../hooks/useSelection';
import { useDeleteWithUndo } from '../hooks/useDeleteWithUndo';
import { useLongPress } from '../hooks/useLongPress';
import { MessageItem } from './MessageItem';
import { SelectionToolbar } from './SelectionToolbar';
import { ConfirmModal } from './ConfirmModal';

interface Message {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Simplified example component
const ChatScreenMinimal: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'user', text: 'Hello', timestamp: new Date() },
    { id: '2', sender: 'model', text: 'Hi there!', timestamp: new Date() },
    { id: '3', sender: 'user', text: 'How are you?', timestamp: new Date() },
  ]);

  // ========================================================================
  // STEP 1: Initialize selection hooks
  // ========================================================================

  const {
    isSelectMode,
    selectedCount,
    enterSelectMode,
    exitSelectMode,
    toggleSelection,
    isSelected,
    getSelectedArray,
    clearSelection,
  } = useSelection();

  const {
    isDeleting,
    deletedIds,
    undoTimeLeft,
    showConfirm,
    deleteMessages,
    undoDelete,
    openConfirm,
    closeConfirm,
  } = useDeleteWithUndo(
    // Optimistic delete: remove from state
    (ids) => {
      console.log('Optimistic delete:', ids);
      setMessages(prev => prev.filter(msg => !ids.includes(msg.id)));
    },
    // Restore: re-add to state (or fetch from backend)
    (ids) => {
      console.log('Restore called for:', ids);
      // In a real app, fetch from backend or keep local copy
    }
  );

  // ========================================================================
  // STEP 2: Render messages with selection support
  // ========================================================================

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Selection toolbar appears when in select mode */}
      {isSelectMode && (
        <SelectionToolbar
          selectedCount={selectedCount}
          onDelete={openConfirm}
          onCancel={exitSelectMode}
          isLoading={isDeleting}
        />
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          // Setup long-press detection
          const longPressHandlers = useLongPress(
            () => {
              console.log('Long press detected on message:', msg.id);
              enterSelectMode();
              toggleSelection(msg.id);
            },
            undefined,
            { delay: 500 }
          );

          return (
            <MessageItem
              key={msg.id}
              message={msg}
              isSelected={isSelected(msg.id)}
              isSelectMode={isSelectMode}
              onToggleSelect={toggleSelection}
              onLongPress={() => {
                enterSelectMode();
                toggleSelection(msg.id);
              }}
            >
              {/* Message bubble */}
              <div
                className={`
                  p-3 rounded-lg
                  ${msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-black'}
                `}
                {...longPressHandlers}
              >
                <p>{msg.text}</p>
                <span className="text-xs opacity-70">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </MessageItem>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Messages?"
        message="These messages will be deleted permanently."
        count={selectedCount}
        onConfirm={async () => {
          closeConfirm();
          const selectedIds = getSelectedArray();
          await deleteMessages(selectedIds);
          clearSelection();
        }}
        onCancel={closeConfirm}
        isLoading={isDeleting}
        showUndo={deletedIds !== null}
        undoTimeLeft={undoTimeLeft}
        onUndo={undoDelete}
      />

      {/* Undo notification */}
      {deletedIds && undoTimeLeft > 0 && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg flex gap-3">
          <span>{deletedIds.length} message(s) deleted</span>
          <button
            onClick={undoDelete}
            className="font-bold underline hover:opacity-80"
          >
            Undo ({undoTimeLeft}s)
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatScreenMinimal;

// ============================================================================
// HOW IT WORKS (Step-by-step user interaction)
// ============================================================================

/*

1. USER LONG-PRESSES A MESSAGE (hold for 500ms)
   ↓
   useLongPress detects long-press
   ↓
   enterSelectMode() is called
   toggleSelection(messageId) adds message to selectedIds
   ↓
   isSelectMode becomes true
   SelectionToolbar appears
   Checkboxes appear on all messages

2. USER TAPS OTHER MESSAGES TO SELECT
   ↓
   toggleSelection(messageId) is called for each
   selectedCount increases
   ↓
   Selected messages show filled checkbox

3. USER CLICKS "DELETE" BUTTON
   ↓
   openConfirm() opens ConfirmModal
   User sees "3 messages will be deleted"

4. USER CONFIRMS DELETION
   ↓
   deleteMessages(selectedIds) is called
   ↓
   OPTIMISTIC UPDATE:
   - Messages removed from UI immediately (setMessages filter)
   - User sees deletion happen right away
   ↓
   API CALL (in background):
   - bulkSoftDelete(ids) calls Supabase RPC
   - API soft-deletes messages on backend

5. API RETURNS SUCCESS
   ↓
   startUndoCountdown() is called
   ↓
   Green toast shows "3 messages deleted"
   "Undo (12s)" button appears
   Countdown timer starts

6A. USER CLICKS "UNDO" (within 12 seconds)
    ↓
    undoDelete() is called
    ↓
    OPTIMISTIC RESTORE:
    - Messages re-added to local state
    - User sees messages appear again
    ↓
    API CALL:
    - restoreMessages(ids) calls Supabase RPC
    - Backend restores the messages
    ↓
    Undo toast disappears
    Messages stay restored

6B. USER WAITS 12 SECONDS (no undo)
    ↓
    Undo timer expires
    Toast disappears
    Messages permanently deleted

*/

// ============================================================================
// DEBUGGING / LOGGING
// ============================================================================

/*

To debug, look for these console logs:

[selection] entering select mode
[selection] long-press on message: msg-123
[selection] deleting messages: [msg-1, msg-2, msg-3]
[delete] successfully deleted 3 messages
[undo] successfully restored 3 messages

If deletion fails:
[API] Error deleting messages: Network error
[delete] error: Network error
(Messages are rolled back and user sees error)

*/

// ============================================================================
// CUSTOMIZATION EXAMPLES
// ============================================================================

/*

1. CHANGE LONG-PRESS DURATION FROM 500ms TO 300ms:

const longPressHandlers = useLongPress(
  onLongPress,
  undefined,
  { delay: 300 }  // <-- Changed from 500
);

---

2. CHANGE UNDO TIMEOUT FROM 12 SECONDS TO 30 SECONDS:

In useDeleteWithUndo.ts, change:
undoTimerRef.current = setTimeout(() => { ... }, 12000);
to:
undoTimerRef.current = setTimeout(() => { ... }, 30000);

---

3. ADD TOAST NOTIFICATIONS:

Install your toast library:
npm install react-toastify

Then in useDeleteWithUndo.ts:
import { toast } from 'react-toastify';

if (result.success) {
  toast.success(`${ids.length} messages deleted`);
  startUndoCountdown(ids);
} else {
  toast.error(result.error);
  onMessagesRestore(ids);
}

---

4. CHANGE STYLING:

SelectionToolbar.tsx:
- Modify the gradient: from-pink-50 to-purple-50
- Change button colors: bg-red-600 hover:bg-red-700
- Adjust padding: py-3 (make taller/shorter)

ConfirmModal.tsx:
- Change modal width: max-w-sm (small), max-w-lg (large)
- Modify button colors: bg-red-600, bg-gray-200
- Change border radius: rounded-lg, rounded-2xl

MessageItem.tsx:
- Change checkbox size: w-6 h-6 (larger)
- Change colors: text-pink-600, text-gray-400
- Modify hover effect: hover:bg-white/20

*/

// ============================================================================
// TESTING (Manual QA Checklist)
// ============================================================================

/*

MOBILE (Touch):
[ ] Long-press (hold 500ms) on message enters select mode
[ ] All messages show checkboxes
[ ] Tapping message toggles checkbox
[ ] Selected count shows in toolbar
[ ] Delete button disabled when nothing selected
[ ] Click Delete → confirmation modal appears
[ ] Confirmation shows correct count
[ ] Click Delete again → messages disappear immediately
[ ] Green toast with "Undo (12s)" appears
[ ] Tap Undo → messages reappear
[ ] Wait 12s → undo toast disappears

DESKTOP (Mouse):
[ ] Right-click on message enters select mode
[ ] Left-click toggles checkbox
[ ] All other flow same as mobile
[ ] Keyboard shortcuts work (Escape to exit, Delete to trigger modal)

ACCESSIBILITY:
[ ] Checkboxes are focusable with Tab key
[ ] Checkboxes have ARIA labels
[ ] Buttons have accessible names
[ ] Colors contrast properly
[ ] Screen reader can read toolbar

ERROR SCENARIOS:
[ ] If API fails, messages are restored (optimistic rollback)
[ ] If undo API fails, message shown
[ ] Network errors are handled gracefully

*/
