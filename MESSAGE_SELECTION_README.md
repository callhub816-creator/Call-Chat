# 📱 Message Selection & Delete Feature - Complete Implementation

> Long-press to select mode + multi-message delete with undo for React chat apps

## 🚀 Quick Start

### What You Get

✅ **Long-press detection** (500ms on touch, right-click on desktop)  
✅ **Select mode** with checkboxes on all messages  
✅ **Selection toolbar** with Delete/Cancel buttons  
✅ **Confirmation modal** before deletion  
✅ **Optimistic UI updates** (instant deletion)  
✅ **Undo functionality** (12-second window)  
✅ **Keyboard support** (Escape, Delete keys)  
✅ **Full accessibility** (ARIA labels, focusable controls)  

### Files Created (8 Total)

**Hooks** (Reusable logic):
- `hooks/useLongPress.ts` - Detect long-press/right-click
- `hooks/useSelection.ts` - Manage selection state
- `hooks/useDeleteWithUndo.ts` - Handle delete flow with undo

**Components** (UI elements):
- `components/MessageItem.tsx` - Message wrapper with checkbox
- `components/SelectionToolbar.tsx` - Toolbar with Delete/Cancel
- `components/ConfirmModal.tsx` - Delete confirmation modal

**API**:
- `api/messages.ts` - Backend integration (Supabase RPC)

**Documentation**:
- `SELECTION_INTEGRATION_GUIDE.md` - Step-by-step walkthrough
- `CHATSCREEN_PATCH.md` - Exact code snippets for ChatScreen.tsx
- `MINIMAL_EXAMPLE.md` - Simplified working example
- `MESSAGE_SELECTION_SUMMARY.md` - Complete reference

## 📋 Integration Checklist

```
[ ] Copy all files to your project:
    - hooks/useLongPress.ts
    - hooks/useSelection.ts
    - hooks/useDeleteWithUndo.ts
    - components/MessageItem.tsx
    - components/SelectionToolbar.tsx
    - components/ConfirmModal.tsx
    - api/messages.ts

[ ] Add imports to ChatScreen.tsx

[ ] Add state hooks (useSelection + useDeleteWithUndo)

[ ] Wrap message map with MessageItem component

[ ] Add SelectionToolbar to render

[ ] Add ConfirmModal to render

[ ] Add Undo notification UI

[ ] Test long-press to enter select mode

[ ] Test message selection and deletion

[ ] Test undo functionality

[ ] Test on mobile and desktop
```

## 📖 Documentation

| File | Purpose |
|------|---------|
| **MINIMAL_EXAMPLE.md** | 👈 **START HERE** - Simplified example |
| **SELECTION_INTEGRATION_GUIDE.md** | Step-by-step integration walkthrough |
| **CHATSCREEN_PATCH.md** | Exact code patches for ChatScreen.tsx |
| **MESSAGE_SELECTION_SUMMARY.md** | Complete API reference |

## 🎯 How It Works (5-Minute Overview)

### 1. Long-Press to Enter Select Mode
```
User long-presses (hold 500ms) or right-clicks a message
↓
useLongPress hook detects long-press
↓
enterSelectMode() activates
↓
Checkboxes appear on all messages
```

### 2. Select Messages
```
User taps/clicks checkbox or message
↓
toggleSelection() adds/removes ID from selectedIds Set
↓
Selected count updates in toolbar
↓ Multiple selections tracked
```

### 3. Delete with Confirmation
```
User clicks Delete button
↓
ConfirmModal shows count of messages
↓
User confirms deletion
↓
Optimistic UI: messages removed immediately
↓
API call: bulkSoftDelete() soft-deletes on backend
```

### 4. Undo (12 Seconds)
```
Green toast appears: "3 messages deleted"
↓
User can click "Undo (12s)" within 12 seconds
↓
Optimistic restore: messages reappear
↓
API call: restoreMessages() restores on backend
↓ OR timeout expires and deletion is permanent
```

### 5. Exit Select Mode
```
User clicks Cancel, presses Escape, or waits for undo
↓
exitSelectMode() called
↓
Checkboxes hidden, selection cleared
↓
Back to normal chat view
```

## 🔧 Customization

### Change Long-Press Duration
```typescript
// In useLongPress call, change delay (in milliseconds)
useLongPress(onLongPress, onClick, { delay: 300 }) // 300ms instead of 500ms
```

### Change Undo Duration
```typescript
// In useDeleteWithUndo.ts, find this line:
undoTimerRef.current = setTimeout(() => { ... }, 12000);
// Change 12000 to your preferred milliseconds (e.g., 30000 for 30 seconds)
```

### Change Styling
All components use Tailwind CSS. Edit the className strings:
- `SelectionToolbar.tsx` - Toolbar colors/layout
- `ConfirmModal.tsx` - Modal appearance
- `MessageItem.tsx` - Checkbox styling

### Add Toast Notifications
Install: `npm install react-toastify`

In `useDeleteWithUndo.ts`:
```typescript
import { toast } from 'react-toastify';

if (result.success) {
  toast.success(`${ids.length} messages deleted`);
}
```

## 🔌 API Integration

The code assumes these Supabase RPC functions:

```sql
-- Soft-delete messages
CREATE FUNCTION messages_bulk_soft_delete(message_ids UUID[])
RETURNS TABLE(success BOOLEAN, deleted_count INT) AS $$
BEGIN
  UPDATE messages SET deleted_at = NOW()
  WHERE id = ANY(message_ids);
  RETURN QUERY SELECT true, array_length(message_ids, 1);
END;
$$ LANGUAGE PLPGSQL;

-- Restore messages
CREATE FUNCTION messages_restore(message_ids UUID[])
RETURNS TABLE(success BOOLEAN, restored_count INT) AS $$
BEGIN
  UPDATE messages SET deleted_at = NULL
  WHERE id = ANY(message_ids);
  RETURN QUERY SELECT true, array_length(message_ids, 1);
END;
$$ LANGUAGE PLPGSQL;
```

If you don't have these, modify `api/messages.ts` to call your custom endpoints.

## 🧪 Testing

### Manual QA Checklist

```
MOBILE (Touch):
[ ] Long-press message enters select mode
[ ] All messages show checkboxes
[ ] Tapping message toggles checkbox
[ ] Selected count shows in toolbar
[ ] Click Delete → confirmation modal
[ ] Click Delete → messages disappear immediately
[ ] Green "Undo" toast appears
[ ] Click Undo → messages reappear
[ ] Wait 12s → undo disappears

DESKTOP (Mouse):
[ ] Right-click message enters select mode
[ ] Left-click toggles checkbox
[ ] Keyboard: Escape exits select mode
[ ] Keyboard: Delete triggers confirmation

ACCESSIBILITY:
[ ] Checkboxes focusable with Tab
[ ] ARIA labels readable
[ ] Buttons have accessible names
[ ] High contrast colors
```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 💡 Performance Notes

- Uses React hooks efficiently (no unnecessary re-renders)
- Selection state is a Set (O(1) lookups)
- Optimistic updates for instant UI feedback
- Graceful error handling with rollback

## 🔒 Accessibility Features

- ✅ ARIA labels on all controls
- ✅ Keyboard navigation (Tab, Escape, Delete)
- ✅ Semantic HTML elements
- ✅ Focus indicators on buttons
- ✅ High contrast colors
- ✅ Screen reader support

## 📚 Code Examples

### Basic Setup
```typescript
import { useSelection } from '../hooks/useSelection';
import { useDeleteWithUndo } from '../hooks/useDeleteWithUndo';
import { useLongPress } from '../hooks/useLongPress';

export const ChatScreen = () => {
  const { isSelectMode, selectedCount, /* ... */ } = useSelection();
  const { isDeleting, deleteMessages, /* ... */ } = useDeleteWithUndo(/* ... */);
  
  // Wrap messages with MessageItem component
  // Add SelectionToolbar and ConfirmModal
};
```

### Long-Press Handler
```typescript
const handlers = useLongPress(
  () => {
    enterSelectMode();
    toggleSelection(messageId);
  },
  undefined,
  { delay: 500 }
);

<div {...handlers}>Message</div>
```

### Delete Flow
```typescript
<button onClick={() => deleteMessages(getSelectedArray())}>
  Delete {selectedCount} messages
</button>
```

## 🐛 Debugging

Look for these console logs:

```javascript
[selection] entering select mode
[selection] long-press on message: msg-123
[selection] deleting messages: [msg-1, msg-2, msg-3]
[delete] successfully deleted 3 messages
[undo] successfully restored 3 messages
```

## ❓ FAQ

**Q: Does this work on mobile?**  
A: Yes! Long-press (hold for 500ms) works on touch devices.

**Q: Can I customize the undo timeout?**  
A: Yes, change the timeout in `useDeleteWithUndo.ts` (currently 12000ms).

**Q: What if the delete API fails?**  
A: Messages are automatically restored (optimistic rollback).

**Q: Can I add keyboard shortcuts?**  
A: Yes, there's example code in `CHATSCREEN_PATCH.md` (Escape, Delete keys).

**Q: How do I style the toolbar?**  
A: Edit the Tailwind classes in `SelectionToolbar.tsx`.

**Q: Does it support multiple selection modes?**  
A: Yes, you can extend `useSelection` to add shift-click range selection (see comments in MINIMAL_EXAMPLE.md).

## 📝 License

Use freely in your projects. Based on React hooks and Tailwind CSS best practices.

## 🚀 Next Steps

1. Copy all 7 files to your project
2. Read `MINIMAL_EXAMPLE.md` for overview
3. Follow `SELECTION_INTEGRATION_GUIDE.md` step-by-step
4. Refer to `CHATSCREEN_PATCH.md` for exact code
5. Test on mobile and desktop
6. Customize styling/timing as needed

---

**Questions? Check the documentation files above or review the inline code comments.**

Happy coding! 🎉
