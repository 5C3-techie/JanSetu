export * from './types';
export * from './localStorageProvider';

// FUTURE FIREBASE INTEGRATION PLACEHOLDER:
// To switch from Local/Demo storage to Firebase Firestore and Firebase Storage:
// 1. Install firebase SDK (`npm i firebase`)
// 2. Implement `firebaseStoreProvider.ts` with matching method signatures
// 3. Export methods from `firebaseStoreProvider` here instead of `localStorageProvider`
// The rest of the Jan-Setu application UI & logic requires ZERO changes!
