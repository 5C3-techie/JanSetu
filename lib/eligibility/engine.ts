import { CitizenProfile, Scheme, EligibilityResult, MatchStatus, VaultDocument } from '../storage/types';
import { Language, translateOccupation } from '../i18n/translations';

/**
 * Deterministic Eligibility Engine for Jan-Setu
 * Evaluates citizen attributes against curated scheme rules strictly and deterministically.
 */
export function evaluateEligibility(
  profile: CitizenProfile,
  scheme: Scheme,
  vaultDocs: VaultDocument[] = [],
  lang: Language = 'en'
): EligibilityResult {
  const isTe = lang === 'te';
  const matchedCriteria: string[] = [];
  const unmatchedCriteria: string[] = [];
  const missingInformation: string[] = [];

  const { eligibility, requiredDocuments } = scheme;

  // 1. Age Verification
  if (eligibility.minAge !== null || eligibility.maxAge !== null) {
    if (!profile.age || profile.age === 0) {
      missingInformation.push(isTe ? 'ప్రొఫైల్‌లో వయస్సు నమోదు చేయలేదు' : 'Age not specified in profile');
    } else {
      const minPass = eligibility.minAge === null || profile.age >= eligibility.minAge;
      const maxPass = eligibility.maxAge === null || profile.age <= eligibility.maxAge;
      if (minPass && maxPass) {
        if (eligibility.minAge && eligibility.maxAge) {
          matchedCriteria.push(
            isTe 
              ? `వయస్సు (${profile.age} సం.) నిర్దేశిత పరిమితి ${eligibility.minAge}–${eligibility.maxAge} సం. లోపు ఉంది`
              : `Age (${profile.age} yrs) falls within required range of ${eligibility.minAge}–${eligibility.maxAge} yrs`
          );
        } else if (eligibility.minAge) {
          matchedCriteria.push(
            isTe
              ? `వయస్సు (${profile.age} సం.) కనీస పరిమితి ${eligibility.minAge}+ సం. నిబంధనను సంతృప్తిపరిచింది`
              : `Age (${profile.age} yrs) meets minimum requirement of ${eligibility.minAge}+ yrs`
          );
        } else if (eligibility.maxAge) {
          matchedCriteria.push(
            isTe
              ? `వయస్సు (${profile.age} సం.) గరిష్ట పరిమితి ${eligibility.maxAge} సం. లోపే ఉంది`
              : `Age (${profile.age} yrs) meets maximum limit of ${eligibility.maxAge} yrs`
          );
        }
      } else {
        unmatchedCriteria.push(
          isTe
            ? `వయస్సు (${profile.age} సం.) అర్హత పరిమితికి (${eligibility.minAge ?? 0}–${eligibility.maxAge ?? 'పరిమితి లేదు'} సం.) సరిపోలలేదు`
            : `Age (${profile.age} yrs) does not meet requirement (${eligibility.minAge ?? 0}–${eligibility.maxAge ?? 'No limit'} yrs)`
        );
      }
    }
  }

  // 2. Annual Income Limit
  if (eligibility.incomeMax !== null) {
    if (profile.annualIncome === undefined || profile.annualIncome === null) {
      missingInformation.push(isTe ? 'వార్షిక ఆదాయం నమోదు చేయలేదు' : 'Annual income not specified');
    } else if (profile.annualIncome <= eligibility.incomeMax) {
      matchedCriteria.push(
        isTe
          ? `వార్షిక ఆదాయం (₹${profile.annualIncome.toLocaleString('en-IN')}) నిర్దేశిత పరిమితి (<= ₹${eligibility.incomeMax.toLocaleString('en-IN')}) లోపే ఉంది`
          : `Annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) is within limit (<= ₹${eligibility.incomeMax.toLocaleString('en-IN')})`
      );
    } else {
      unmatchedCriteria.push(
        isTe
          ? `వార్షిక ఆదాయం (₹${profile.annualIncome.toLocaleString('en-IN')}) పథక పరిమితిని (₹${eligibility.incomeMax.toLocaleString('en-IN')}) మించింది`
          : `Annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) exceeds limit (₹${eligibility.incomeMax.toLocaleString('en-IN')})`
      );
    }
  }

  // 3. State & Location
  if (eligibility.states && eligibility.states.length > 0 && !eligibility.states.includes('All')) {
    if (!profile.state) {
      missingInformation.push(isTe ? 'నివాస రాష్ట్రం నమోదు చేయలేదు' : 'State residence not specified');
    } else if (eligibility.states.includes(profile.state)) {
      matchedCriteria.push(
        isTe
          ? `అర్హత కలిగిన రాష్ట్ర నివాసి (${profile.state})`
          : `Resident of target state (${profile.state})`
      );
    } else {
      unmatchedCriteria.push(
        isTe
          ? `ఈ పథకం ${eligibility.states.join(', ')} రాష్ట్రాలకు మాత్రమే పరిమితం (మీరు ఎంచుకున్నది: ${profile.state || 'ఏదీ లేదు'})`
          : `Scheme is restricted to ${eligibility.states.join(', ')} (You selected ${profile.state || 'None'})`
      );
    }
  } else {
    matchedCriteria.push(isTe ? 'అన్ని రాష్ట్రాల పౌరులకు వర్తించే జాతీయ పథకం' : 'Nationwide scheme open to all states');
  }

  // 4. Rural Resident Requirement
  if (eligibility.ruralOnly) {
    if (profile.isRural) {
      matchedCriteria.push(isTe ? 'గ్రామీణ ప్రాంత నివాసి' : 'Resident of rural area');
    } else {
      unmatchedCriteria.push(isTe ? 'ఈ పథకం కేవలం గ్రామీణ నివాసితులకు మాత్రమే' : 'Scheme is exclusively for rural residents');
    }
  }

  // 5. Land Ownership Condition
  if (eligibility.landOwnership !== null) {
    if (eligibility.landOwnership === true) {
      if (profile.landOwnership) {
        matchedCriteria.push(isTe ? 'భూమి యాజమాన్య హక్కు / పట్టాదారు పాస్ పుస్తకం కలిగి ఉన్నారు' : 'Holds land ownership title / Pattadar passbook');
      } else {
        unmatchedCriteria.push(isTe ? 'భూమి యాజమాన్యం అవసరం (మీరు భూమి లేదని పేర్కొన్నారు)' : 'Requires land ownership title (You indicated no land ownership)');
      }
    } else if (eligibility.landOwnership === false) {
      if (!profile.landOwnership) {
        matchedCriteria.push(isTe ? 'భూమి లేని నిరుపేద కుటుంబాల నిబంధన వర్తిస్తుంది' : 'Satisfies non-landowner / landless requirement');
      } else {
        unmatchedCriteria.push(isTe ? 'ఈ పథకం కేవలం భూమి లేని కుటుంబాలకు మాత్రమే' : 'Scheme target is landless households');
      }
    }
  }

  // 6. Occupation Matching
  if (eligibility.occupation && eligibility.occupation.length > 0) {
    if (!profile.occupation) {
      missingInformation.push(isTe ? 'వృత్తి నమోదు చేయలేదు' : 'Occupation not specified');
    } else {
      const normOcc = profile.occupation.toLowerCase().replace(/[\s-]/g, '_');
      const isOccMatched = eligibility.occupation.some(occ => {
        const normSchemeOcc = occ.toLowerCase();
        return normOcc.includes(normSchemeOcc) || normSchemeOcc.includes(normOcc) || normOcc === 'all';
      });

      const occLabel = isTe ? translateOccupation(profile.occupation, 'te') : formatOccupation(profile.occupation);

      if (isOccMatched) {
        matchedCriteria.push(
          isTe
            ? `లబ్ధిదారుని వృత్తి (${occLabel}) పథక లక్ష్య వర్గానికి సరిపోయింది`
            : `Occupation (${occLabel}) matches scheme target group`
        );
      } else {
        const eligibleList = isTe 
          ? eligibility.occupation.map(o => translateOccupation(o, 'te')).join(', ')
          : eligibility.occupation.map(formatOccupation).join(', ');

        unmatchedCriteria.push(
          isTe
            ? `వృత్తి (${occLabel}) అర్హత గల జాబితాలో (${eligibleList}) లేదు`
            : `Occupation (${occLabel}) does not match eligible list (${eligibleList})`
        );
      }
    }
  }

  // 7. Gender Matching
  if (eligibility.gender && eligibility.gender !== 'all') {
    if (profile.gender && profile.gender.toLowerCase() === eligibility.gender.toLowerCase()) {
      const genderLabel = isTe ? (eligibility.gender === 'female' ? 'మహిళ' : eligibility.gender === 'male' ? 'పురుషుడు' : eligibility.gender) : eligibility.gender;
      matchedCriteria.push(
        isTe
          ? `లింగ అర్హత నిబంధన (${genderLabel}) సంతృప్తిపరిచింది`
          : `Gender requirement (${eligibility.gender}) satisfied`
      );
    } else {
      const targetGenderLabel = isTe ? (eligibility.gender === 'female' ? 'మహిళా' : eligibility.gender === 'male' ? 'పురుష' : eligibility.gender) : eligibility.gender;
      unmatchedCriteria.push(
        isTe
          ? `ఈ పథకం ప్రత్యేకంగా ${targetGenderLabel} దరఖాస్తుదారులకు మాత్రమే`
          : `Scheme is specifically for ${eligibility.gender} applicants`
      );
    }
  }

  // 8. Social Category Matching
  if (eligibility.category && eligibility.category.length > 0 && !eligibility.category.includes('All')) {
    if (!profile.category) {
      missingInformation.push(isTe ? 'సామాజిక వర్గం (SC/ST/BC/General) నమోదు చేయలేదు' : 'Category (SC/ST/BC/General) not specified');
    } else if (eligibility.category.includes(profile.category)) {
      matchedCriteria.push(
        isTe
          ? `సామాజిక వర్గం (${profile.category}) అర్హత పరిధిలో ఉంది`
          : `Category (${profile.category}) listed under target categories`
      );
    } else {
      unmatchedCriteria.push(
        isTe
          ? `సామాజిక వర్గం (${profile.category}) ఈ పథకం కింద నిర్దేశించబడలేదు (${eligibility.category.join(', ')})`
          : `Category (${profile.category}) not listed for this scheme (${eligibility.category.join(', ')})`
      );
    }
  }

  // Determine Match Status & Internal Score
  let matchStatus: MatchStatus = 'MATCHED';
  let statusLabel = isTe ? 'అర్హత కావచ్చు' : 'Likely Match';

  if (unmatchedCriteria.length > 0) {
    matchStatus = 'NOT_MATCHED';
    statusLabel = isTe ? 'అర్హత లేదు' : 'Not a Match Based on Current Information';
  } else if (missingInformation.length > 0) {
    matchStatus = 'PARTIAL_MATCH';
    statusLabel = isTe ? 'పరిశీలన అవసరం' : 'Needs Verification';
  }

  // Calculate internal score (0-100)
  const totalEvaluated = matchedCriteria.length + unmatchedCriteria.length + missingInformation.length;
  const matchScore = totalEvaluated > 0 ? Math.round((matchedCriteria.length / totalEvaluated) * 100) : 50;

  // Cross-reference documents strictly against the user's Document Vault
  const availableDocuments: string[] = [];
  const missingDocuments: string[] = [];

  requiredDocuments.forEach(docName => {
    const isUploadedInVault = checkVaultDocMatch(docName, vaultDocs);

    if (isUploadedInVault) {
      availableDocuments.push(docName);
    } else {
      missingDocuments.push(docName);
    }
  });

  const readyCount = availableDocuments.length;
  const totalDocCount = requiredDocuments.length;
  const readinessPercentage = totalDocCount > 0 ? Math.round((readyCount / totalDocCount) * 100) : 100;
  const readinessLabel = isTe 
    ? `${readyCount} / ${totalDocCount} పత్రాలు సిద్ధం` 
    : `${readyCount} / ${totalDocCount} Documents Ready`;

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

function checkVaultDocMatch(docName: string, vaultDocs: VaultDocument[]): boolean {
  if (!vaultDocs || vaultDocs.length === 0) return false;
  const target = docName.toLowerCase();
  return vaultDocs.some(d => {
    const type = d.documentType.toLowerCase();
    const fname = d.fileName.toLowerCase();
    return (
      type.includes(target) ||
      target.includes(type) ||
      fname.includes(target) ||
      (target.includes('aadhaar') && (type.includes('aadhaar') || fname.includes('aadhaar'))) ||
      (target.includes('income') && (type.includes('income') || fname.includes('income'))) ||
      (target.includes('caste') && (type.includes('caste') || fname.includes('caste'))) ||
      (target.includes('bank') && (type.includes('bank') || fname.includes('bank'))) ||
      (target.includes('ration') && (type.includes('ration') || type.includes('food') || fname.includes('ration'))) ||
      (target.includes('passbook') && (type.includes('passbook') || type.includes('land') || fname.includes('passbook'))) ||
      (target.includes('residence') && (type.includes('residence') || type.includes('domicile') || fname.includes('residence'))) ||
      (target.includes('disability') && (type.includes('disability') || type.includes('sadarem') || fname.includes('disability')))
    );
  });
}

/**
 * Evaluate all schemes for a citizen profile
 */
export function evaluateAllSchemes(
  profile: CitizenProfile,
  schemes: Scheme[],
  vaultDocs: VaultDocument[] = [],
  lang: Language = 'en'
): EligibilityResult[] {
  return schemes
    .map(scheme => evaluateEligibility(profile, scheme, vaultDocs, lang))
    .sort((a, b) => {
      // Prioritize MATCHED -> PARTIAL_MATCH -> NOT_MATCHED
      const statusOrder: Record<MatchStatus, number> = { MATCHED: 1, PARTIAL_MATCH: 2, NOT_MATCHED: 3 };
      if (statusOrder[a.matchStatus] !== statusOrder[b.matchStatus]) {
        return statusOrder[a.matchStatus] - statusOrder[b.matchStatus];
      }
      return b.matchScore - a.matchScore;
    });
}

function formatOccupation(occ: string): string {
  return occ.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
