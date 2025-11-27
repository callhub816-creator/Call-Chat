
import { Persona } from '../types';

// Keys for Local Storage
const PARTNERS_KEY = 'callhub_local_partners';
// New required prefix as requested: chat_history_<id>
const CHATS_PREFIX = 'chat_history_';

interface StoredPartner extends Persona {
  createdAt: number;
  retentionUntil: number;
}

interface StoredMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  mood?: string;
  timestamp: string; // ISO
}

export const storage = {
  // --- PARTNERS ---
  
  getPartners: (): StoredPartner[] => {
    try {
      const raw = localStorage.getItem(PARTNERS_KEY);
      if (!raw) return [];
      
      const partners: StoredPartner[] = JSON.parse(raw);
      
      // Filter out expired partners automatically
      const validPartners = partners.filter(p => p.retentionUntil >= Date.now());
      
      // If we filtered some out, update storage immediately
      if (validPartners.length !== partners.length) {
        localStorage.setItem(PARTNERS_KEY, JSON.stringify(validPartners));
        // Also cleanup their chats
        partners.forEach(p => {
          if (p.retentionUntil < Date.now()) {
            localStorage.removeItem(CHATS_PREFIX + p.id);
          }
        });
      }
      
      return validPartners;
    } catch (e) {
      console.error("Storage Read Error", e);
      return [];
    }
  },

  savePartner: (persona: Persona) => {
    const partners = storage.getPartners();
    const now = Date.now();
    const retentionDate = now + 7 * 24 * 60 * 60 * 1000; // +7 Days

    const newPartner: StoredPartner = {
      ...persona,
      createdAt: now,
      retentionUntil: retentionDate
    };

    // Remove existing if updating
    const updatedList = [newPartner, ...partners.filter(p => p.id !== persona.id)];
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(updatedList));
    return newPartner;
  },

  deletePartner: (id: string | number) => {
    const partners = storage.getPartners();
    const updated = partners.filter(p => p.id !== id);
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(updated));
    localStorage.removeItem(CHATS_PREFIX + id);
  },

  extendRetention: (id: string | number) => {
    const partners = storage.getPartners();
    const partner = partners.find(p => p.id === id);
    if (partner) {
      // Add 7 days to current expiry
      partner.retentionUntil = partner.retentionUntil + 7 * 24 * 60 * 60 * 1000;
      
      localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
      return partner;
    }
    return null;
  },

  // --- CHATS ---

  getMessages: (partnerId: string | number): StoredMessage[] => {
    try {
      const raw = localStorage.getItem(CHATS_PREFIX + partnerId);
      if (!raw) return [];
      const messages: StoredMessage[] = JSON.parse(raw);

      // Keep only messages from the last 7 days
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recent = messages.filter(m => {
        const ts = new Date(m.timestamp).getTime();
        return !isNaN(ts) && ts >= cutoff;
      });

      // If some old messages were present, overwrite storage with only recent ones
      if (recent.length !== messages.length) {
        if (recent.length > 0) {
          localStorage.setItem(CHATS_PREFIX + partnerId, JSON.stringify(recent));
        } else {
          localStorage.removeItem(CHATS_PREFIX + partnerId);
        }
      }

      return recent;
    } catch (e) {
      console.error('Storage getMessages error', e);
      return [];
    }
  },

  saveMessage: (partnerId: string | number, message: StoredMessage) => {
    try {
      const messages = storage.getMessages(partnerId);
      messages.push(message);
      // Keep only last 100 messages to avoid excessive storage growth
      const pruned = messages.slice(-100);
      localStorage.setItem(CHATS_PREFIX + partnerId, JSON.stringify(pruned));
    } catch (e) {
      console.error('Storage saveMessage error', e);
    }
  },

  clearHistory: (partnerId: string | number) => {
    localStorage.removeItem(CHATS_PREFIX + partnerId);
  }
  ,

  // Clear all chat_history_* keys (used when user logs out)
  clearAllHistories: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith(CHATS_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.error('Storage clearAllHistories error', e);
    }
  }
};
