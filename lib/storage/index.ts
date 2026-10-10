export * from './types';
export * from './localStorageProvider';
export * from './firebaseFirestoreProvider';
export * from './firebaseStorageProvider';

import { CitizenProfile, VaultDocument, DeadlineReminder } from './types';
import { profileStore, documentStore, reminderStore, savedSchemeStore } from './localStorageProvider';
import { firebaseProfileStore, firebaseDocumentStore, firebaseReminderStore, firebaseSavedSchemeStore } from './firebaseFirestoreProvider';
import { isFirebaseConfigured } from '@/lib/firebase';

export const getUnifiedProfile = async (uid?: string): Promise<CitizenProfile> => {
  if (uid && isFirebaseConfigured()) {
    const firestoreProfile = await firebaseProfileStore.getProfile(uid);
    if (firestoreProfile) return firestoreProfile;
  }
  return profileStore.getProfile();
};

export const saveUnifiedProfile = async (profile: CitizenProfile, uid?: string): Promise<void> => {
  // Always update local cache/state
  profileStore.saveProfile(profile);

  if (uid && isFirebaseConfigured()) {
    await firebaseProfileStore.saveProfile(uid, profile);
  }
};

export const getUnifiedDocuments = async (uid?: string): Promise<VaultDocument[]> => {
  if (uid && isFirebaseConfigured()) {
    const docs = await firebaseDocumentStore.getDocuments(uid);
    if (docs.length > 0) return docs;
  }
  return documentStore.getDocuments();
};

export const getUnifiedReminders = async (uid?: string): Promise<DeadlineReminder[]> => {
  if (uid && isFirebaseConfigured()) {
    const rems = await firebaseReminderStore.getReminders(uid);
    if (rems.length > 0) return rems;
  }
  return reminderStore.getReminders();
};

export const addUnifiedReminder = async (
  reminder: Omit<DeadlineReminder, 'id' | 'createdAt' | 'status'>,
  uid?: string
): Promise<DeadlineReminder> => {
  const localRem = reminderStore.addReminder(reminder);

  if (uid && isFirebaseConfigured()) {
    await firebaseReminderStore.addReminder(localRem);
  }

  return localRem;
};

export const getUnifiedSavedSchemes = async (uid?: string): Promise<string[]> => {
  if (uid && isFirebaseConfigured()) {
    const ids = await firebaseSavedSchemeStore.getSavedSchemes(uid);
    if (ids.length > 0) return ids;
  }
  return savedSchemeStore.getSavedSchemes();
};

export const toggleUnifiedSavedScheme = async (schemeId: string, uid?: string): Promise<boolean> => {
  const isSavedLocal = savedSchemeStore.toggleSavedScheme(schemeId);

  if (uid && isFirebaseConfigured()) {
    return await firebaseSavedSchemeStore.toggleSavedScheme(uid, schemeId);
  }

  return isSavedLocal;
};

export const isProfileComplete = (profile?: CitizenProfile | null): boolean => {
  if (!profile) return false;
  return Boolean(
    profile.name && profile.name.trim().length > 0 &&
    profile.age > 0 &&
    profile.state && profile.state.trim().length > 0
  );
};

export const calculateProfileCompletion = (profile?: CitizenProfile | null): number => {
  if (!profile) return 0;
  const fields = [
    Boolean(profile.name && profile.name.trim()),
    Boolean(profile.age && profile.age > 0),
    Boolean(profile.gender && profile.gender !== 'all'),
    Boolean(profile.mobileNumber || profile.email),
    Boolean(profile.state && profile.state.trim()),
    Boolean(profile.district && profile.district.trim()),
    Boolean(profile.category && profile.category !== 'All'),
    Boolean(profile.annualIncome && profile.annualIncome > 0),
    Boolean(profile.occupation && profile.occupation.trim()),
    Boolean(profile.educationLevel),
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};


