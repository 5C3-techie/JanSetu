import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { CitizenProfile, VaultDocument, DeadlineReminder, Scheme } from './types';

export const firebaseProfileStore = {
  getProfile: async (uid: string): Promise<CitizenProfile | null> => {
    if (!isFirebaseConfigured() || !uid) return null;
    try {
      const docRef = doc(db, 'profiles', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as CitizenProfile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching Firestore profile:', err);
      return null;
    }
  },

  saveProfile: async (uid: string, profile: CitizenProfile): Promise<void> => {
    if (!isFirebaseConfigured() || !uid) return;
    try {
      const docRef = doc(db, 'profiles', uid);
      const cleanProfile = {
        ...profile,
        id: uid,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, cleanProfile, { merge: true });
    } catch (err) {
      console.error('Error saving Firestore profile:', err);
      throw err;
    }
  },
};

export const firebaseDocumentStore = {
  getDocuments: async (uid: string): Promise<VaultDocument[]> => {
    if (!isFirebaseConfigured() || !uid) return [];
    try {
      const q = query(collection(db, 'documents'), where('userId', '==', uid));
      const querySnap = await getDocs(q);
      const docs: VaultDocument[] = [];
      querySnap.forEach((docSnap) => {
        docs.push(docSnap.data() as VaultDocument);
      });
      return docs;
    } catch (err) {
      console.error('Error fetching Firestore documents:', err);
      return [];
    }
  },

  addDocumentMetadata: async (docData: VaultDocument): Promise<void> => {
    if (!isFirebaseConfigured() || !docData.userId) return;
    try {
      const docRef = doc(db, 'documents', docData.id);
      await setDoc(docRef, docData);
    } catch (err) {
      console.error('Error saving document metadata:', err);
      throw err;
    }
  },

  deleteDocumentMetadata: async (docId: string): Promise<void> => {
    if (!isFirebaseConfigured() || !docId) return;
    try {
      const docRef = doc(db, 'documents', docId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting document metadata:', err);
      throw err;
    }
  }
};

export const firebaseReminderStore = {
  getReminders: async (uid: string): Promise<DeadlineReminder[]> => {
    if (!isFirebaseConfigured() || !uid) return [];
    try {
      const q = query(collection(db, 'reminders'), where('userId', '==', uid));
      const querySnap = await getDocs(q);
      const reminders: DeadlineReminder[] = [];
      querySnap.forEach((docSnap) => {
        reminders.push(docSnap.data() as DeadlineReminder);
      });
      return reminders;
    } catch (err) {
      console.error('Error fetching Firestore reminders:', err);
      return [];
    }
  },

  addReminder: async (reminder: DeadlineReminder): Promise<void> => {
    if (!isFirebaseConfigured() || !reminder.userId) return;
    try {
      const docRef = doc(db, 'reminders', reminder.id);
      await setDoc(docRef, reminder);
    } catch (err) {
      console.error('Error saving reminder:', err);
      throw err;
    }
  },

  dismissReminder: async (reminderId: string): Promise<void> => {
    if (!isFirebaseConfigured() || !reminderId) return;
    try {
      const docRef = doc(db, 'reminders', reminderId);
      await updateDoc(docRef, { status: 'dismissed' });
    } catch (err) {
      console.error('Error dismissing reminder:', err);
      throw err;
    }
  },

  deleteReminder: async (reminderId: string): Promise<void> => {
    if (!isFirebaseConfigured() || !reminderId) return;
    try {
      const docRef = doc(db, 'reminders', reminderId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting reminder:', err);
      throw err;
    }
  }
};

export const firebaseSavedSchemeStore = {
  getSavedSchemes: async (uid: string): Promise<string[]> => {
    if (!isFirebaseConfigured() || !uid) return [];
    try {
      const q = query(collection(db, 'savedSchemes'), where('userId', '==', uid));
      const querySnap = await getDocs(q);
      const schemeIds: string[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.schemeId) schemeIds.push(data.schemeId);
      });
      return schemeIds;
    } catch (err) {
      console.error('Error fetching saved schemes:', err);
      return [];
    }
  },

  toggleSavedScheme: async (uid: string, schemeId: string): Promise<boolean> => {
    if (!isFirebaseConfigured() || !uid || !schemeId) return false;
    try {
      const id = `${uid}_${schemeId}`;
      const docRef = doc(db, 'savedSchemes', id);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        await deleteDoc(docRef);
        return false;
      } else {
        await setDoc(docRef, {
          id,
          userId: uid,
          schemeId,
          savedAt: new Date().toISOString(),
        });
        return true;
      }
    } catch (err) {
      console.error('Error toggling saved scheme:', err);
      throw err;
    }
  }
};

