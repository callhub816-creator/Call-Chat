import { useState, useCallback, useRef } from 'react';
import { bulkSoftDelete, restoreMessages } from '../api/messages';

interface DeleteState {
  isDeleting: boolean;
  deletedIds: string[] | null;
  undoTimeLeft: number;
  showConfirm: boolean;
}

/**
 * Custom hook to manage delete flow with undo
 * Handles optimistic updates, rollback, and undo with timer
 */
export const useDeleteWithUndo = (
  onMessagesDelete: (ids: string[]) => void,
  onMessagesRestore: (ids: string[]) => void,
) => {
  const [deleteState, setDeleteState] = useState<DeleteState>({
    isDeleting: false,
    deletedIds: null,
    undoTimeLeft: 0,
    showConfirm: false,
  });

  const undoTimerRef = useRef<number | null>(null);
  const undoCountdownRef = useRef<number | null>(null);

  // Start undo countdown (12 seconds)
  const startUndoCountdown = useCallback((ids: string[]) => {
    let timeLeft = 12;
    setDeleteState(prev => ({
      ...prev,
      deletedIds: ids,
      undoTimeLeft: timeLeft,
    }));

    // Update countdown every second
    undoCountdownRef.current = window.setInterval(() => {
      timeLeft -= 1;
      setDeleteState(prev => ({
        ...prev,
        undoTimeLeft: timeLeft,
      }));

      if (timeLeft <= 0) {
        if (undoCountdownRef.current !== null) clearInterval(undoCountdownRef.current);
        setDeleteState(prev => ({
          ...prev,
          deletedIds: null,
          undoTimeLeft: 0,
        }));
      }
    }, 1000);

    // Auto-clear deleted state after 12 seconds
    undoTimerRef.current = window.setTimeout(() => {
      setDeleteState(prev => ({
        ...prev,
        deletedIds: null,
        undoTimeLeft: 0,
      }));
    }, 12000);
  }, []);

  // Clear undo state and timer
  const clearUndoState = useCallback(() => {
    if (undoTimerRef.current !== null) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    if (undoCountdownRef.current !== null) {
      clearInterval(undoCountdownRef.current);
      undoCountdownRef.current = null;
    }
    setDeleteState(prev => ({
      ...prev,
      deletedIds: null,
      undoTimeLeft: 0,
    }));
  }, []);

  // Perform the delete
  const deleteMessages = useCallback(
    async (ids: string[]) => {
      if (!ids || ids.length === 0) return;

      setDeleteState(prev => ({
        ...prev,
        isDeleting: true,
        showConfirm: false,
      }));

      try {
        // Optimistic update
        onMessagesDelete(ids);

        // Call API
        const result = await bulkSoftDelete(ids);

        if (result.success) {
          console.log('[delete] successfully deleted', ids.length, 'messages');
          // Start undo countdown
          startUndoCountdown(ids);
        } else {
          console.error('[delete] error:', result.error);
          // Rollback optimistic update
          onMessagesRestore(ids);
          // TODO: Show error toast
        }
      } catch (error) {
        console.error('[delete] exception:', error);
        // Rollback optimistic update
        onMessagesRestore(ids);
        // TODO: Show error toast
      } finally {
        setDeleteState(prev => ({
          ...prev,
          isDeleting: false,
        }));
      }
    },
    [onMessagesDelete, onMessagesRestore, startUndoCountdown],
  );

  // Perform the undo
  const undoDelete = useCallback(async () => {
    const ids = deleteState.deletedIds;
    if (!ids || ids.length === 0) return;

    try {
      setDeleteState(prev => ({
        ...prev,
        isDeleting: true,
      }));

      // Optimistic restore
      onMessagesRestore(ids);

      // Call restore API
      const result = await restoreMessages(ids);

      if (result.success) {
        console.log('[undo] successfully restored', ids.length, 'messages');
      } else {
        console.error('[undo] error:', result.error);
        // Rollback and delete again if restore failed
        onMessagesDelete(ids);
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('[undo] exception:', error);
      // Rollback optimistic restore
      onMessagesDelete(ids);
      // TODO: Show error toast
    } finally {
      clearUndoState();
      setDeleteState(prev => ({
        ...prev,
        isDeleting: false,
      }));
    }
  }, [deleteState.deletedIds, onMessagesRestore, onMessagesDelete, clearUndoState]);

  const openConfirm = useCallback(() => {
    setDeleteState(prev => ({
      ...prev,
      showConfirm: true,
    }));
  }, []);

  const closeConfirm = useCallback(() => {
    setDeleteState(prev => ({
      ...prev,
      showConfirm: false,
    }));
  }, []);

  return {
    ...deleteState,
    deleteMessages,
    undoDelete,
    openConfirm,
    closeConfirm,
    clearUndoState,
  };
};
