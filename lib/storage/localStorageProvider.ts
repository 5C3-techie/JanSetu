import { CitizenProfile, VaultDocument, DeadlineReminder, Scheme } from './types';
import rawSchemes from '@/data/schemes.json';

export const EMPTY_CITIZEN_PROFILE: CitizenProfile = {
  id: '',
  name: '',
  age: 0,
  gender: 'all',
  state: '',
  district: '',
  isRural: false,
  occupation: '',
  annualIncome: 0,
  landOwnership: false,
  category: 'All',
  hasAadhaar: false,
  hasIncomeCert: false,
  hasCasteCert: false,
  hasLandDoc: false,
  hasBankPassbook: false,
  hasRationCard: false,
  hasDisabilityCert: false,
};

// Deprecated demo profile alias for type backward compatibility
export const DEMO_CITIZEN_PROFILE = EMPTY_CITIZEN_PROFILE;

export const INITIAL_VAULT_DOCUMENTS: VaultDocument[] = [];

export const INITIAL_REMINDERS: DeadlineReminder[] = [];

// Helper for client-side local storage fallback
const isClient = typeof window !== 'undefined';

export const profileStore = {
  getProfile: (): CitizenProfile => {
    if (!isClient) return EMPTY_CITIZEN_PROFILE;
    const stored = localStorage.getItem('jan_setu_profile');
    return stored ? JSON.parse(stored) : EMPTY_CITIZEN_PROFILE;
  },
  saveProfile: (profile: CitizenProfile): void => {
    if (isClient) {
      localStorage.setItem('jan_setu_profile', JSON.stringify(profile));
    }
  },
  resetProfileToEmpty: (): CitizenProfile => {
    if (isClient) {
      localStorage.setItem('jan_setu_profile', JSON.stringify(EMPTY_CITIZEN_PROFILE));
    }
    return EMPTY_CITIZEN_PROFILE;
  }
};

export const schemeStore = {
  getAllSchemes: (): Scheme[] => {
    return rawSchemes as Scheme[];
  },
  getSchemeById: (id: string): Scheme | undefined => {
    return (rawSchemes as Scheme[]).find(s => s.schemeId === id);
  }
};

export const documentStore = {
  getDocuments: (): VaultDocument[] => {
    if (!isClient) return [];
    const stored = localStorage.getItem('jan_setu_documents');
    return stored ? JSON.parse(stored) : [];
  },
  addDocument: (doc: Omit<VaultDocument, 'id' | 'uploadedAt'>): VaultDocument => {
    const docs = documentStore.getDocuments();
    const newDoc: VaultDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    const updated = [newDoc, ...docs];
    if (isClient) {
      localStorage.setItem('jan_setu_documents', JSON.stringify(updated));
    }
    return newDoc;
  },
  deleteDocument: (id: string): void => {
    const docs = documentStore.getDocuments();
    const updated = docs.filter(d => d.id !== id);
    if (isClient) {
      localStorage.setItem('jan_setu_documents', JSON.stringify(updated));
    }
  }
};

const getReminderStorageKey = (userId?: string): string => {
  if (userId && userId.trim()) {
    return `jan_setu_reminders_${userId.trim()}`;
  }
  return 'jan_setu_reminders_guest';
};

export const reminderStore = {
  getReminders: (userId?: string): DeadlineReminder[] => {
    if (!isClient) return [];
    const userKey = getReminderStorageKey(userId);
    const stored = localStorage.getItem(userKey);
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored reminders:', e);
        return [];
      }
    }

    // Safe one-time legacy migration from 'jan_setu_reminders' if userKey does not exist yet
    const legacyStored = localStorage.getItem('jan_setu_reminders');
    if (legacyStored) {
      try {
        const legacyReminders = JSON.parse(legacyStored);
        if (Array.isArray(legacyReminders) && legacyReminders.length > 0) {
          const assignedUid = userId && userId.trim() ? userId.trim() : 'guest_user';
          const migrated: DeadlineReminder[] = legacyReminders.map(r => ({
            ...r,
            userId: r.userId && r.userId !== 'guest_user' ? r.userId : assignedUid,
          }));
          localStorage.setItem(userKey, JSON.stringify(migrated));
          return migrated;
        }
      } catch (e) {
        console.error('Error migrating legacy reminders:', e);
      }
    }

    return [];
  },

  addReminder: (
    reminder: Omit<DeadlineReminder, 'id' | 'createdAt' | 'status'>,
    userId?: string
  ): DeadlineReminder => {
    const assignedUid = userId && userId.trim() ? userId.trim() : (reminder.userId || 'guest_user');
    const userKey = getReminderStorageKey(assignedUid);
    const reminders = reminderStore.getReminders(assignedUid);
    const newReminder: DeadlineReminder = {
      ...reminder,
      userId: assignedUid,
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const updated = [newReminder, ...reminders];
    if (isClient) {
      localStorage.setItem(userKey, JSON.stringify(updated));
    }
    return newReminder;
  },

  dismissReminder: (id: string, userId?: string): void => {
    const assignedUid = userId && userId.trim() ? userId.trim() : undefined;
    const userKey = getReminderStorageKey(assignedUid);
    const reminders = reminderStore.getReminders(assignedUid);
    const updated = reminders.map(r => (r.id === id ? { ...r, status: 'dismissed' as const } : r));
    if (isClient) {
      localStorage.setItem(userKey, JSON.stringify(updated));
    }
  },

  deleteReminder: (id: string, userId?: string): void => {
    const assignedUid = userId && userId.trim() ? userId.trim() : undefined;
    const userKey = getReminderStorageKey(assignedUid);
    const reminders = reminderStore.getReminders(assignedUid);
    const updated = reminders.filter(r => r.id !== id);
    if (isClient) {
      localStorage.setItem(userKey, JSON.stringify(updated));
    }
  }
};

export const savedSchemeStore = {
  getSavedSchemes: (): string[] => {
    if (!isClient) return [];
    const stored = localStorage.getItem('jan_setu_saved_schemes');
    return stored ? JSON.parse(stored) : [];
  },
  toggleSavedScheme: (id: string): boolean => {
    const saved = savedSchemeStore.getSavedSchemes();
    const exists = saved.includes(id);
    const updated = exists ? saved.filter(s => s !== id) : [...saved, id];
    if (isClient) {
      localStorage.setItem('jan_setu_saved_schemes', JSON.stringify(updated));
    }
    return !exists;
  }
};


