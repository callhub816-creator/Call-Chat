/**
 * INTEGRATION GUIDE FOR MESSAGE SELECTION + DELETE
 * 
 * This file shows how to integrate the new selection and delete features into ChatScreen.tsx
 * 
 * Step-by-step changes needed:
 */

// ============================================================================
// STEP 1: Add imports at the top of ChatScreen.tsx
// ============================================================================

import { useSelection } from '../hooks/useSelection';
import { useDeleteWithUndo } from '../hooks/useDeleteWithUndo';
import { useLongPress } from '../hooks/useLongPress';
import { MessageItem } from './MessageItem';
import { SelectionToolbar } from './SelectionToolbar';
import { ConfirmModal } from './ConfirmModal';

// ============================================================================
// STEP 2: In ChatScreen component, after other state declarations, add:
// ============================================================================

// Selection state management
const {
  selectedIds,
  isSelectMode,
  selectedCount,
  enterSelectMode,
  exitSelectMode,
  toggleSelection,
  isSelected,
  getSelectedArray,
  clearSelection,
} = useSelection();

// Delete flow management
const {
  isDeleting,
  deletedIds,
  undoTimeLeft,
  showConfirm,
  deleteMessages,
  undoDelete,
  openConfirm,
  closeConfirm,
  clearUndoState,
} = useDeleteWithUndo(
  (ids) => {
    // Optimistic delete: remove from local state
    setMessages(prev => prev.filter(msg => !ids.includes(msg.id)));
  },
  (ids) => {
    // Restore: re-add to local state (would need message data)
    // For now, we'll rely on refresh from backend
    console.log('[restore] restoring messages:', ids);
  }
);

// ============================================================================
// STEP 3: Update the messages.map() section to wrap with MessageItem
// ============================================================================

// BEFORE: messages.map((msg) => (
//   <div key={msg.id} className={...}>
//     ...message content...
//   </div>
// ))

// AFTER:
messages.map((msg) => {
  const msgLongPressHandlers = useLongPress(
    () => {
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
      <div
        className={`relative flex flex-col touch-pan-y ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
        onTouchStart={(e) => handleTouchStart(e, msg.id)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...msgLongPressHandlers}
      >
        {/* All existing message content stays here */}
        {/* ... existing reply indicators, mood badge, message bubble, etc ... */}
      </div>
    </MessageItem>
  );
})

// ============================================================================
// STEP 4: Add SelectionToolbar before the CHAT MESSAGES section
// ============================================================================

{/* SELECTION TOOLBAR - Add this before the <div ref={scrollRef}> section */}
{isSelectMode && (
  <SelectionToolbar
    selectedCount={selectedCount}
    onDelete={openConfirm}
    onCancel={exitSelectMode}
    isLoading={isDeleting}
  />
)}

// ============================================================================
// STEP 5: Add ConfirmModal and Undo UI
// ============================================================================

{/* DELETE CONFIRMATION MODAL */}
<ConfirmModal
  isOpen={showConfirm}
  title="Delete Messages?"
  message="These messages will be permanently removed from your conversation."
  count={selectedCount}
  onConfirm={async () => {
    closeConfirm();
    const selectedArray = getSelectedArray();
    await deleteMessages(selectedArray);
    clearSelection();
  }}
  onCancel={closeConfirm}
  isLoading={isDeleting}
/>

{/* UNDO NOTIFICATION - Add near bottom of component */}
{deletedIds && undoTimeLeft > 0 && (
  <div className="fixed bottom-20 right-4 z-40 bg-green-600 text-white rounded-lg p-4 shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
    <span className="text-sm font-medium">
      {deletedIds.length} message{deletedIds.length === 1 ? '' : 's'} deleted
    </span>
    <button
      onClick={undoDelete}
      disabled={isDeleting}
      className="font-bold underline hover:opacity-80 disabled:opacity-50 transition"
    >
      Undo ({undoTimeLeft}s)
    </button>
  </div>
)}

// ============================================================================
// STEP 6: Handle clicking outside to exit select mode
// ============================================================================

// Add to the main container:
onClick={(e) => {
  // Exit select mode if clicking outside message area
  if (e.target === e.currentTarget && isSelectMode) {
    exitSelectMode();
  }
}}

// ============================================================================
// STEP 7: Add keyboard support (OPTIONAL - bonus feature)
// ============================================================================

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape to exit select mode
    if (e.key === 'Escape' && isSelectMode) {
      exitSelectMode();
    }
    // Ctrl+A to select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isSelectMode) {
      e.preventDefault();
      selectAll(messages.map(m => m.id));
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isSelectMode, messages, exitSelectMode, selectAll]);

// ============================================================================
// COMPLETE EXAMPLE DIFF BELOW
// ============================================================================

/*

IMPORTS TO ADD:
================

import { useSelection } from '../hooks/useSelection';
import { useDeleteWithUndo } from '../hooks/useDeleteWithUndo';
import { useLongPress } from '../hooks/useLongPress';
import { MessageItem } from './MessageItem';
import { SelectionToolbar } from './SelectionToolbar';
import { ConfirmModal } from './ConfirmModal';


STATE TO ADD (after existing state declarations):
==================================================

  // Selection state
  const {
    selectedIds,
    isSelectMode,
    selectedCount,
    enterSelectMode,
    exitSelectMode,
    toggleSelection,
    isSelected,
    getSelectedArray,
    clearSelection,
  } = useSelection();

  // Delete flow
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
    (ids) => {
      setMessages(prev => prev.filter(msg => !ids.includes(msg.id)));
    },
    (ids) => {
      console.log('[restore] would restore:', ids);
    }
  );


RENDER CHANGES:
===============

1. Wrap the messages container with selection context
2. Add SelectionToolbar above the messages scroll area
3. Wrap each message with MessageItem component
4. Add ConfirmModal for deletion confirmation
5. Add Undo notification UI
6. Add click-outside handler to exit select mode

*/
