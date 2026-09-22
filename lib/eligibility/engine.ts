import { CitizenProfile, Scheme, EligibilityResult, MatchStatus, VaultDocument } from '../storage/types';

/**
 * Deterministic Eligibility Engine for Jan-Setu
 * Evaluates citizen attributes against curated scheme rules strictly and deterministically.
 */
export function evaluateEligibility(
  profile: CitizenProfile,
  scheme: Scheme,
  vaultDocs: VaultDocument[] = []
): EligibilityResult {
  const matchedCriteria: string[] = [];
  const unmatchedCriteria: string[] = [];
  const missingInformation: string[] = [];

  const { eligibility, requiredDocuments } = scheme;

  // 1. Age Verification
  if (eligibility.minAge !== null || eligibility.maxAge !== null) {
    if (!profile.age || profile.age === 0) {
      missingInformation.push('Age not specified in profile');
    } else {
      const minPass = eligibility.minAge === null || profile.age >= eligibility.minAge;
      const maxPass = eligibility.maxAge === null || profile.age <= eligibility.maxAge;
      if (minPass && maxPass) {
        if (eligibility.minAge && eligibility.maxAge) {
          matchedCriteria.push(`Age (${profile.age} yrs) falls within required range of ${eligibility.minAge}–${eligibility.maxAge} yrs`);
        } else if (eligibility.minAge) {
          matchedCriteria.push(`Age (${profile.age} yrs) meets minimum requirement of ${eligibility.minAge}+ yrs`);
        } else if (eligibility.maxAge) {
          matchedCriteria.push(`Age (${profile.age} yrs) meets maximum limit of ${eligibility.maxAge} yrs`);
        }
      } else {
        unmatchedCriteria.push(`Age (${profile.age} yrs) does not meet requirement (${eligibility.minAge ?? 0}–${eligibility.maxAge ?? 'No limit'} yrs)`);
      }
    }
  }

  // 2. Annual Income Limit
  if (eligibility.incomeMax !== null) {
    if (profile.annualIncome === undefined || profile.annualIncome === null) {
      missingInformation.push('Annual income not specified');
    } else if (profile.annualIncome <= eligibility.incomeMax) {
      matchedCriteria.push(`Annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) is within limit (<= ₹${eligibility.incomeMax.toLocaleString('en-IN')})`);
    } else {
      unmatchedCriteria.push(`Annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) exceeds limit (₹${eligibility.incomeMax.toLocaleString('en-IN')})`);
    }
  }

  // 3. State & Location
  if (eligibility.states && eligibility.states.length > 0 && !eligibility.states.includes('All')) {
    if (!profile.state) {
      missingInformation.push('State residence not specified');
    } else if (eligibility.states.includes(profile.state)) {
      matchedCriteria.push(`Resident of target state (${profile.state})`);
    } else {
      unmatchedCriteria.push(`Scheme is restricted to ${eligibility.states.join(', ')} (You selected ${profile.state || 'None'})`);
    }
  } else {
    matchedCriteria.push('Nationwide scheme open to all states');
  }

  // 4. Rural Resident Requirement
  if (eligibility.ruralOnly) {
    if (profile.isRural) {
      matchedCriteria.push('Resident of rural area');
    } else {
      unmatchedCriteria.push('Scheme is exclusively for rural residents');
    }
  }

  // 5. Land Ownership Condition
  if (eligibility.landOwnership !== null) {
    if (eligibility.landOwnership === true) {
      if (profile.landOwnership) {
        matchedCriteria.push('Holds land ownership title / Pattadar passbook');
      } else {
        unmatchedCriteria.push('Requires land ownership title (You indicated no land ownership)');
      }
    } else if (eligibility.landOwnership === false) {
      if (!profile.landOwnership) {
        matchedCriteria.push('Satisfies non-landowner / landless requirement');
      } else {
        unmatchedCriteria.push('Scheme target is landless households');
      }
    }
  }

  // 6. Occupation Matching
  if (eligibility.occupation && eligibility.occupation.length > 0) {
    if (!profile.occupation) {
      missingInformation.push('Occupation not specified');
    } else {
      const normOcc = profile.occupation.toLowerCase().replace(/[\s-]/g, '_');
      const isOccMatched = eligibility.occupation.some(occ => {
        const normSchemeOcc = occ.toLowerCase();
        return normOcc.includes(normSchemeOcc) || normSchemeOcc.includes(normOcc) || normOcc === 'all';
      });

      if (isOccMatched) {
        matchedCriteria.push(`Occupation (${formatOccupation(profile.occupation)}) matches scheme target group`);
      } else {
        unmatchedCriteria.push(`Occupation (${formatOccupation(profile.occupation)}) does not match eligible list (${eligibility.occupation.map(formatOccupation).join(', ')})`);
      }
    }
  }

  // 7. Gender Matching
  if (eligibility.gender && eligibility.gender !== 'all') {
    if (profile.gender && profile.gender.toLowerCase() === eligibility.gender.toLowerCase()) {
      matchedCriteria.push(`Gender requirement (${eligibility.gender}) satisfied`);
    } else {
      unmatchedCriteria.push(`Scheme is specifically for ${eligibility.gender} applicants`);
    }
  }

  // 8. Social Category Matching
  if (eligibility.category && eligibility.category.length > 0 && !eligibility.category.includes('All')) {
    if (!profile.category) {
      missingInformation.push('Category (SC/ST/BC/General) not specified');
    } else if (eligibility.category.includes(profile.category)) {
      matchedCriteria.push(`Category (${profile.category}) listed under target categories`);
    } else {
      unmatchedCriteria.push(`Category (${profile.category}) not listed for this scheme (${eligibility.category.join(', ')})`);
    }
  }

  // Determine Match Status & Internal Score
  let matchStatus: MatchStatus = 'MATCHED';
  let statusLabel = 'Likely Match';

  if (unmatchedCriteria.length > 0) {
    matchStatus = 'NOT_MATCHED';
    statusLabel = 'Not a Match Based on Current Information';
  } else if (missingInformation.length > 0) {
    matchStatus = 'PARTIAL_MATCH';
    statusLabel = 'Needs Verification';
  }

  // Calculate internal score (0-100)
  const totalEvaluated = matchedCriteria.length + unmatchedCriteria.length + missingInformation.length;
  const matchScore = totalEvaluated > 0 ? Math.round((matchedCriteria.length / totalEvaluated) * 100) : 50;

  // Cross-reference documents with vault & profile flags
  const availableDocuments: string[] = [];
  const missingDocuments: string[] = [];

  requiredDocuments.forEach(docName => {
    const isUploadedInVault = vaultDocs.some(d => d.documentType.toLowerCase().includes(docName.toLowerCase()) || docName.toLowerCase().includes(d.documentType.toLowerCase()));
    const isFlaggedInProfile = checkProfileDocFlag(docName, profile);

    if (isUploadedInVault || isFlaggedInProfile) {
      availableDocuments.push(docName);
    } else {
      missingDocuments.push(docName);
    }
  });

  const readyCount = availableDocuments.length;
  const totalDocCount = requiredDocuments.length;
  const readinessPercentage = totalDocCount > 0 ? Math.round((readyCount / totalDocCount) * 100) : 100;
  const readinessLabel = `${readyCount} / ${totalDocCount} Documents Ready`;

  return {
    schemeId: scheme.schemeId,
    scheme,
    matchStatus,
    matchScore,
    statusLabel,
    matchedCriteria,
    unmatchedCriteria,
    missingInformation,
    requiredDocuments,
    availableDocuments,
    missingDocuments,
    readinessPercentage,
    readinessLabel,
  };
}

/**
 * Evaluate all schemes for a citizen profile
 */
export function evaluateAllSchemes(
  profile: CitizenProfile,
  schemes: Scheme[],
  vaultDocs: VaultDocument[] = []
): EligibilityResult[] {
  return schemes
    .map(scheme => evaluateEligibility(profile, scheme, vaultDocs))
    .sort((a, b) => {
      // Prioritize MATCHED -> PARTIAL_MATCH -> NOT_MATCHED
      const statusOrder: Record<MatchStatus, number> = { MATCHED: 1, PARTIAL_MATCH: 2, NOT_MATCHED: 3 };
      if (statusOrder[a.matchStatus] !== statusOrder[b.matchStatus]) {
        return statusOrder[a.matchStatus] - statusOrder[b.matchStatus];
      }
      return b.matchScore - a.matchScore;
    });
}

function checkProfileDocFlag(docName: string, profile: CitizenProfile): boolean {
  const d = docName.toLowerCase();
  if (d.includes('aadhaar') && profile.hasAadhaar) return true;
  if (d.includes('income') && profile.hasIncomeCert) return true;
  if (d.includes('caste') && profile.hasCasteCert) return true;
  if ((d.includes('land') || d.includes('passbook') || d.includes('pattadar')) && profile.hasLandDoc) return true;
  if ((d.includes('bank') || d.includes('passbook')) && profile.hasBankPassbook) return true;
  if ((d.includes('ration') || d.includes('food')) && profile.hasRationCard) return true;
  if (d.includes('disability') && profile.hasDisabilityCert) return true;
  return false;
}

function formatOccupation(occ: string): string {
  return occ.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
