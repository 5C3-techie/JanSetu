import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from '@/lib/firebase';
import { firebaseDocumentStore } from './firebaseFirestoreProvider';
import { VaultDocument } from './types';

export const SUPPORTED_DOCUMENT_TYPES = [
  'Government ID',
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Voter ID',
  'Driving Licence',
  'Passport-size photograph',
  'Income Certificate',
  'Caste Certificate',
  'Residence Certificate',
  'Domicile Certificate',
  'Bank Passbook',
  'Land Ownership Document',
  'Ration Card',
  'Disability Certificate',
  'Age Proof',
  'Education Certificate',
  'Employment Certificate',
  'Other',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const uploadDocumentToVault = async (
  uid: string,
  file: File,
  documentType: string,
  associatedSchemeIds: string[] = []
): Promise<VaultDocument> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured.');
  }

  if (!uid) {
    throw new Error('User authentication required for document upload.');
  }

  // Validate File Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds maximum allowed limit of 10 MB.');
  }

  // Validate File Type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Unsupported file format. Please upload PDF, PNG, JPEG, or WEBP files.');
  }

  const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const storagePath = `users/${uid}/documents/${documentId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  
  const storageRef = ref(storage, storagePath);

  // Upload file to private user-scoped Firebase Storage path
  const uploadTask = await uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      ownerUid: uid,
      documentType,
      uploadedAt: new Date().toISOString(),
    },
  });

  const downloadUrl = await getDownloadURL(uploadTask.ref);

  const docMetadata: VaultDocument = {
    id: documentId,
    documentId,
    userId: uid,
    fileName: file.name,
    documentType,
    fileUrl: downloadUrl,
    storagePath,
    contentType: file.type,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    status: 'Uploaded',
    associatedSchemeIds,
  };

  // Save metadata strictly in Firestore documents collection
  await firebaseDocumentStore.addDocumentMetadata(docMetadata);

  return docMetadata;
};

export const deleteDocumentFromVault = async (
  uid: string,
  docItem: VaultDocument
): Promise<void> => {
  if (!isFirebaseConfigured()) return;

  // 1. Delete from Firebase Storage if storagePath exists
  if (docItem.storagePath) {
    try {
      const storageRef = ref(storage, docItem.storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Could not delete storage object or object missing:', err);
    }
  }

  // 2. Delete metadata from Firestore
  await firebaseDocumentStore.deleteDocumentMetadata(docItem.id);
};
