import { GoogleGenAI } from '@google/genai';
import { CitizenProfile, EligibilityResult, Scheme } from '../storage/types';

// Server-side initialization of Gemini SDK
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Gemini AI Client initialization warning:', err);
  }
}

/**
 * Natural Language Profile Intake Parser using Gemini
 * Extracts structured profile JSON from raw citizen text input or transcribed speech.
 */
export async function parseProfileFromNL(inputText: string): Promise<Partial<CitizenProfile>> {
  if (!aiClient || !apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallbackNLParser(inputText);
  }

  try {
    const prompt = `
You are the profile extraction engine for Jan-Setu, an Indian welfare scheme discovery platform.
Parse the citizen's self-description and extract structured attributes into JSON format matching these exact fields:
- age: number | null
- state: string | null (e.g. "Telangana", "Andhra Pradesh", "Maharashtra")
- district: string | null
- isRural: boolean | null (true if village/rural/panchayat mentioned)
- occupation: string | null ("agricultural_labourer", "farmer", "small_farmer", "unorganised_worker", "artisan", "street_vendor", "domestic_worker", "student", "unemployed")
- annualIncome: number | null (in Rupees INR e.g. 120000 for 1.2 lakh)
- landOwnership: boolean | null (true if owns land/pattadar, false if landless/no land)
- category: string | null ("SC", "ST", "BC", "EBC", "General")
- gender: string | null ("male", "female", "other")
- hasAadhaar: boolean | null
- hasIncomeCert: boolean | null
- hasLandDoc: boolean | null
- hasBankPassbook: boolean | null

Return ONLY valid raw JSON without markdown code blocks.

Citizen text input:
"${inputText}"
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      ...parsed,
      rawInputText: inputText,
    };
  } catch (err) {
    console.error('Gemini NL Parsing failed, switching to rule fallback:', err);
    return fallbackNLParser(inputText);
  }
}

/**
 * Gemini Match Explanation Layer
 * Explains deterministic matching results in simple, plain language (English or Telugu).
 */
export async function generateMatchExplanation(
  profile: CitizenProfile,
  result: EligibilityResult,
  lang: 'en' | 'te' = 'en'
): Promise<{ whyMatched: string[]; missingRequirements: string[]; friendlySummary: string }> {
  const scheme = result.scheme;

  if (!aiClient || !apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallbackExplanation(result, lang);
  }

  try {
    const prompt = `
You are the AI explanation layer of Jan-Setu, a trustworthy Indian civic technology platform.

STRICT SAFETY & ACCURACY INSTRUCTIONS:
1. You MUST ONLY use the scheme information and criteria supplied below.
2. DO NOT invent eligibility criteria, benefits, documents, deadlines, application links, or government rules.
3. NEVER claim official government authority or guarantee official approval.
4. Use compassionate, simple, non-jargon language suitable for a citizen or local worker.
5. Language to output: ${lang === 'te' ? 'Telugu script (తెలుగు)' : 'Simple English'}.

CITIZEN PROFILE:
- Age: ${profile.age}, State: ${profile.state}, Rural: ${profile.isRural ? 'Yes' : 'No'}, Occupation: ${profile.occupation}, Annual Income: ₹${profile.annualIncome}, Land Owner: ${profile.landOwnership ? 'Yes' : 'No'}, Category: ${profile.category}

SCHEME DETAILS:
- Name: ${scheme.name} (${scheme.teluguName})
- Sector: ${scheme.sector}
- Matched Criteria: ${JSON.stringify(result.matchedCriteria)}
- Unmatched / Missing Criteria: ${JSON.stringify([...result.unmatchedCriteria, ...result.missingInformation])}
- Status: ${result.statusLabel}

Format your output strictly as a JSON object with:
{
  "whyMatched": ["bullet point 1", "bullet point 2"],
  "missingRequirements": ["bullet point 1", "bullet point 2"],
  "friendlySummary": "Short 2 sentence warm explanation."
}
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini Explanation generation failed, falling back:', err);
    return fallbackExplanation(result, lang);
  }
}

/**
 * Natural Language Assistant (Ask Jan-Setu Q&A)
 * Answers user questions strictly using retrieved knowledge base context.
 */
export async function answerCitizenQuestion(
  question: string,
  profile: CitizenProfile,
  schemes: Scheme[],
  lang: 'en' | 'te' = 'en'
): Promise<string> {
  if (!aiClient || !apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallbackAssistant(question, schemes, lang);
  }

  try {
    const schemeContext = schemes.map(s => ({
      name: s.name,
      sector: s.sector,
      benefits: s.benefits,
      requiredDocuments: s.requiredDocuments,
      officialSource: s.officialSource,
    }));

    const prompt = `
You are Jan-Setu, an AI assistant for discovering Indian government welfare schemes.

RULES:
- Answer the user's question using ONLY the knowledge base context provided below.
- If information is not available in the context, explicitly say: "This information is currently unavailable in our curated knowledge base or requires official verification."
- NEVER claim official government authority or guarantee scheme approval.
- Language: ${lang === 'te' ? 'Telugu script (తెలుగు)' : 'Simple English'}.

CITIZEN PROFILE:
Name: ${profile.name}, Age: ${profile.age}, State: ${profile.state}, Occupation: ${profile.occupation}, Income: ₹${profile.annualIncome}

SCHEME KNOWLEDGE BASE:
${JSON.stringify(schemeContext, null, 2)}

QUESTION:
"${question}"
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || 'Information unavailable.';
  } catch (err) {
    console.error('Gemini Q&A failed:', err);
    return fallbackAssistant(question, schemes, lang);
  }
}

// Graceful fallback parsers and generator functions when Gemini key is not configured or network fails
function fallbackNLParser(input: string): Partial<CitizenProfile> {
  const lower = input.toLowerCase();
  const extracted: Partial<CitizenProfile> = {};

  const ageMatch = lower.match(/(\d{2})\s*(year|yr|years|old)/);
  if (ageMatch) extracted.age = parseInt(ageMatch[1], 10);

  if (lower.includes('telangana')) extracted.state = 'Telangana';
  if (lower.includes('andhra')) extracted.state = 'Andhra Pradesh';

  if (lower.includes('village') || lower.includes('rural') || lower.includes('gram')) extracted.isRural = true;
  if (lower.includes('urban') || lower.includes('city')) extracted.isRural = false;

  if (lower.includes('agricultural') || lower.includes('labourer') || lower.includes('coolie')) {
    extracted.occupation = 'agricultural_labourer';
  } else if (lower.includes('farmer') || lower.includes('rythu')) {
    extracted.occupation = 'farmer';
  } else if (lower.includes('vendor') || lower.includes('street')) {
    extracted.occupation = 'street_vendor';
  } else if (lower.includes('artisan') || lower.includes('weaver')) {
    extracted.occupation = 'artisan';
  } else if (lower.includes('student')) {
    extracted.occupation = 'student';
  }

  if (lower.includes('1.2') || lower.includes('1,20,000') || lower.includes('1.2 lakh')) {
    extracted.annualIncome = 120000;
  } else if (lower.includes('1.5') || lower.includes('1,50,000') || lower.includes('1.5 lakh')) {
    extracted.annualIncome = 150000;
  } else if (lower.includes('90,000') || lower.includes('90k')) {
    extracted.annualIncome = 90000;
  }

  if (lower.includes('no land') || lower.includes("don't own land") || lower.includes('landless')) {
    extracted.landOwnership = false;
  } else if (lower.includes('own land') || lower.includes('land owner') || lower.includes('pattadar')) {
    extracted.landOwnership = true;
  }

  return extracted;
}

function fallbackExplanation(result: EligibilityResult, lang: 'en' | 'te') {
  if (lang === 'te') {
    return {
      whyMatched: result.matchedCriteria.length > 0
        ? result.matchedCriteria
        : ['మీ సమాచారం ఆధారంగా ప్రాథమిక సరిపోలిక కనుగొనబడింది.'],
      missingRequirements: result.unmatchedCriteria.length > 0 || result.missingInformation.length > 0
        ? [...result.unmatchedCriteria, ...result.missingInformation]
        : ['అదనపు ధృవీకరణ అవసరం కావచ్చు.'],
      friendlySummary: `పథకం నిబంధనల ప్రకారం మీరు లబ్ధి పొందడానికి అర్హులుగా కనిపిస్తున్నారు. తదుపరి పరిశీలన అవసరం.`
    };
  }

  return {
    whyMatched: result.matchedCriteria.length > 0
      ? result.matchedCriteria
      : ['Profile attributes satisfy listed criteria.'],
    missingRequirements: [...result.unmatchedCriteria, ...result.missingInformation],
    friendlySummary: `Based on your profile, you appear to meet the primary criteria listed for ${result.scheme.name}. Official verification will be required.`
  };
}

function fallbackAssistant(question: string, schemes: Scheme[], lang: 'en' | 'te'): string {
  const q = question.toLowerCase();
  const matched = schemes.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.sector.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  );

  if (lang === 'te') {
    if (matched.length > 0) {
      return `జన్-సేతు రికార్డులలో ఈ పథకం గుర్తించబడింది: ${matched[0].name}. ప్రయోజనాలు: ${matched[0].benefits.join(', ')}. కావలసిన పత్రాలు: ${matched[0].requiredDocuments.join(', ')}.`;
    }
    return `క్షమించండి, అందించిన పరిజ్ఞాన వేదికలో మీ ప్రశ్నకు సంబంధించిన ఖచ్చితమైన సమాచారం లభించలేదు. దయచేసి అధికారిక పోర్టల్‌లో సరిచూసుకోండి.`;
  }

  if (matched.length > 0) {
    return `Found relevant scheme in Jan-Setu Knowledge Base: **${matched[0].name}** (${matched[0].sector} Sector).\n\n**Benefits:**\n- ${matched[0].benefits.join('\n- ')}\n\n**Required Documents:**\n- ${matched[0].requiredDocuments.join('\n- ')}\n\n*Source: ${matched[0].officialSource}*`;
  }

  return `Thank you for your question. Based on our curated knowledge base, we found 15 verified schemes across Agriculture, Housing, Health, Social Welfare, and Livelihoods. You can explore details or test your eligibility under the Find Schemes tab. Note: Final approval rests with relevant government authorities.`;
}
