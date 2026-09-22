export interface CitizenProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'all';
  state: string;
  district: string;
  isRural: boolean;
  occupation: string;
  annualIncome: number;
  landOwnership: boolean;
  category: 'SC' | 'ST' | 'BC' | 'EBC' | 'Minority' | 'General' | 'All';
  hasAadhaar: boolean;
  hasIncomeCert: boolean;
  hasCasteCert: boolean;
  hasLandDoc: boolean;
  hasBankPassbook: boolean;
  hasRationCard: boolean;
  hasDisabilityCert: boolean;
  rawInputText?: string;
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
  teluguName: string;
  sector: string;
  description: string;
  teluguDescription: string;
  benefits: string[];
  teluguBenefits: string[];
  eligibility: SchemeEligibility;
  requiredDocuments: string[];
  applicationSteps: string[];
  officialSource: string;
  deadline: string | null;
  deadlineType: 'fixed_date' | 'recurring' | 'rolling' | 'not_available';
  deadlineDetails: string;
  lastVerified: string;
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
  userId: string;
  fileName: string;
  documentType: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  status: 'Uploaded' | 'Not Uploaded' | 'Needs Verification';
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
