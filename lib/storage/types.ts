export interface CitizenProfile {
  id: string;
  // Personal
  name: string;
  fullName?: string;
  dateOfBirth?: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'all';

  // Contact
  mobileNumber?: string;
  email?: string;

  // Location
  state: string;
  district: string;
  mandal?: string;
  villageOrTown?: string;
  ruralOrUrban?: 'rural' | 'urban';
  isRural: boolean;

  // Social
  socialCategory?: 'SC' | 'ST' | 'BC' | 'EBC' | 'Minority' | 'General' | 'All';
  category: 'SC' | 'ST' | 'BC' | 'EBC' | 'Minority' | 'General' | 'All';
  minorityStatus?: boolean;
  disabilityStatus?: boolean;

  // Economic
  annualFamilyIncome?: number;
  annualIncome: number;
  incomeSource?: string;
  employmentStatus?: string;
  occupation: string;

  // Agriculture
  isFarmer?: boolean;
  isAgriculturalLabourer?: boolean;
  ownsLand?: boolean;
  landOwnership: boolean;
  landSize?: number;
  landType?: string;

  // Family
  maritalStatus?: string;
  familySize?: number;
  dependents?: number;
  childrenCount?: number;
  seniorCitizenInHousehold?: boolean;

  // Housing
  housingStatus?: string;
  ownsPuccaHouse?: boolean;

  // Education
  educationLevel?: string;
  studentStatus?: boolean;
  course?: string;
  institutionType?: string;

  // Document Flags
  hasAadhaar: boolean;
  hasIncomeCert: boolean;
  hasCasteCert: boolean;
  hasLandDoc: boolean;
  hasBankPassbook: boolean;
  hasRationCard: boolean;
  hasDisabilityCert: boolean;
  rawInputText?: string;
  updatedAt?: string;
}

export interface SchemeEligibility {
  minAge: number | null;
  maxAge: number | null;
  occupation: string[];
  incomeMax: number | null;
  states: string[];
  ruralOnly: boolean;
  landOwnership: boolean | null;
  category: string[];
  gender: string | null;
}

export interface Scheme {
  schemeId: string;
  name: string;
  officialName?: string;
  teluguName: string;
  level?: 'Central' | 'State';
  ministry?: string;
  department?: string;
  states?: string[];
  sector: string;
  description: string;
  teluguDescription: string;
  benefits: string[];
  teluguBenefits: string[];
  eligibility: SchemeEligibility;
  requiredDocuments: string[];
  applicationSteps: string[];
  applicationProcess?: string[];
  applicationMode?: 'Online' | 'Offline' | 'Both' | 'CSC';
  officialSource: string;
  officialSourceUrl?: string;
  applicationUrl?: string;
  guidelineSourceUrl?: string;
  deadline: string | null;
  applicationDeadline?: string | null;
  deadlineType: 'fixed_date' | 'recurring' | 'rolling' | 'not_available';
  deadlineDetails?: string;
  deadlineSource?: string;
  deadlineLastVerified?: string;
  lastVerified: string;
  verificationStatus: 'verified' | 'needs_verification';
  verifiedBy?: string;
  verificationNotes?: string;
}

export type MatchStatus = 'MATCHED' | 'PARTIAL_MATCH' | 'NOT_MATCHED';

export interface EligibilityResult {
  schemeId: string;
  scheme: Scheme;
  matchStatus: MatchStatus;
  matchScore: number; // Internal rule matching score (0-100)
  statusLabel: string; // "Likely Match" | "Needs Verification" | "Not a Match"
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  missingInformation: string[];
  requiredDocuments: string[];
  availableDocuments: string[];
  missingDocuments: string[];
  readinessPercentage: number;
  readinessLabel: string; // e.g. "3 / 4 Documents Ready"
}

export interface VaultDocument {
  id: string;
  documentId?: string;
  userId: string;
  fileName: string;
  documentType: string;
  fileUrl: string;
  storagePath?: string;
  contentType?: string;
  fileSize: number;
  uploadedAt: string;
  status: 'Uploaded' | 'Not Uploaded' | 'Needs Verification' | 'uploaded' | 'required' | 'optional' | 'needsVerification';
  associatedSchemeIds: string[];
}

export interface DeadlineReminder {
  id: string;
  userId: string;
  schemeId: string;
  schemeName: string;
  deadline: string;
  reminderDate: string;
  reminderType: '30_days_before' | '7_days_before' | '1_day_before' | 'custom';
  status: 'active' | 'triggered' | 'dismissed';
  notes?: string;
  createdAt: string;
}

