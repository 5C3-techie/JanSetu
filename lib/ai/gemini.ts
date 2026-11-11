import { GoogleGenAI } from '@google/genai';
import { CitizenProfile, EligibilityResult, Scheme } from '../storage/types';

// Server-side initialization of Gemini SDK
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  } catch (err) {
    console.warn('Gemini AI Client initialization warning:', err);
    return null;
  }
}

// Direct execution model: gemini-3.1-flash-lite (fast, direct execution without checking multiple models)
export const GEMINI_MODEL = 'gemini-3.1-flash-lite';

export interface SpeechTranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  model: string;
}

/**
 * Speech-to-Text Translation using Gemini 3.1 Flash Lite
 * Translates speech transcription between English and Telugu (or vice versa),
 * preserving civic terminology, welfare scheme names, Indian currencies and numbers.
 */
export async function translateSpeechText(params: {
  text: string;
  sourceLang?: 'en' | 'te' | 'auto';
  targetLang: 'en' | 'te';
}): Promise<SpeechTranslationResult> {
  const { text, sourceLang = 'auto', targetLang } = params;

  if (!text || text.trim() === '') {
    return {
      originalText: '',
      translatedText: '',
      sourceLang,
      targetLang,
      model: GEMINI_MODEL,
    };
  }

  // If source and target are the same language, return cleaned text
  if (sourceLang === targetLang) {
    return {
      originalText: text,
      translatedText: text.trim(),
      sourceLang,
      targetLang,
      model: GEMINI_MODEL,
    };
  }

  const targetLangLabel = targetLang === 'te' ? 'Telugu (తెలుగు లిపి)' : 'English';
  const sourceLangLabel = sourceLang === 'te' ? 'Telugu' : sourceLang === 'en' ? 'English' : 'auto-detected language (Telugu or English)';

  if (!getAiClient()) {
    return {
      originalText: text,
      translatedText: text, // Fallback if no API key
      sourceLang,
      targetLang,
      model: 'fallback-no-key',
    };
  }

  try {
    const prompt = `
You are an expert civic translation engine powered by Gemini 3.1 Flash Lite for Jan-Setu, an Indian government welfare schemes platform.
Translate the following speech transcript from ${sourceLangLabel} into ${targetLangLabel}.

TRANSLATION REQUIREMENTS:
1. Provide a natural, idiomatic, and accurate translation for Indian citizens and welfare caseworkers.
2. If translating into Telugu, output strictly in authentic Telugu script (తెలుగు).
3. If translating into English, use clear, accessible, and simple English.
4. Correct minor phonetic ASR / Speech-to-text recognition errors common in Indian English or Telugu speech (e.g. "Raithu Bandu" -> "Rythu Bandhu", "Asara" -> "Aasara", "Adhar" -> "Aadhaar").
5. Preserve key official scheme names, government terms, numbers, dates, and currency values (e.g., ₹, INR, Lakhs, Crores, Pattadar Passbook, White Ration Card).
6. Return ONLY the translated text without extra conversation, commentary, quotes, or markdown code blocks.

Speech transcript to translate:
"""${text}"""
`;

    const translated = await callGemini(prompt);
    const cleanOutput = translated.trim().replace(/^["']|["']$/g, '');

    return {
      originalText: text,
      translatedText: cleanOutput,
      sourceLang,
      targetLang,
      model: GEMINI_MODEL,
    };
  } catch (err: any) {
    console.error('Gemini 3.1 Flash Lite translation failed:', err);
    throw err;
  }
}

/**
 * Directly executes a Gemini prompt using gemini-3.1-flash-lite
 */
async function callGemini(prompt: string): Promise<string> {
  const client = getAiClient();
  if (!client) {
    throw new Error('Gemini API client not initialized. Check GEMINI_API_KEY in environment variables.');
  }

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  if (response && response.text) {
    return response.text;
  }

  throw new Error('Empty response received from Gemini');
}

function safeExtractJson<T>(raw: string, fallback: T): T {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(raw.trim());
  } catch (err) {
    console.warn('JSON parsing failed, falling back:', err);
    return fallback;
  }
}

/**
 * Natural Language Profile Intake Parser using Gemini
 * Extracts structured profile JSON from raw citizen text input or transcribed speech.
 */
export async function parseProfileFromNL(inputText: string): Promise<Partial<CitizenProfile>> {
  if (!getAiClient()) {
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

    const text = await callGemini(prompt);
    const parsed = safeExtractJson<any>(text, null);
    if (!parsed) {
      return fallbackNLParser(inputText);
    }

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

  if (!getAiClient()) {
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

    const text = await callGemini(prompt);
    const parsed = safeExtractJson<any>(text, null);
    if (!parsed || !parsed.friendlySummary) {
      return fallbackExplanation(result, lang);
    }
    return parsed;
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
  if (!getAiClient()) {
    return fallbackAssistant(question, schemes, lang);
  }

  try {
    const schemeContext = schemes.map(s => ({
      name: s.name,
      teluguName: s.teluguName,
      sector: s.sector,
      description: s.description,
      benefits: s.benefits,
      requiredDocuments: s.requiredDocuments,
      officialSource: s.officialSource,
    }));

    const prompt = `
You are Jan-Setu, a dedicated, trustworthy AI assistant for discovering Indian government welfare schemes (especially Telangana State and Central Government schemes).

RULES:
- Answer the citizen's question accurately and clearly using the knowledge base context provided below.
- Highlight key benefits, eligibility criteria, and required documents using clean bullet points and markdown.
- If citizen profile information is provided (e.g. occupation, state, age), personalize the guidance for them.
- If information is not in the knowledge base, state politely: "I don't have verified information about that requirement in the Jan-Setu knowledge base. Please check the official scheme source."
- NEVER claim official government authority or guarantee official approval.
- DO NOT invent government schemes, eligibility rules, application URLs, or document requirements.
- Language to output: ${lang === 'te' ? 'Telugu script (తెలుగు)' : 'Simple, friendly English'}.

CITIZEN PROFILE:
Name: ${profile?.name || 'Citizen'}, Age: ${profile?.age || 'Not specified'}, State: ${profile?.state || 'Not specified'}, Occupation: ${profile?.occupation || 'Not specified'}, Income: ₹${profile?.annualIncome || 'Not specified'}

SCHEME KNOWLEDGE BASE:
${JSON.stringify(schemeContext, null, 2)}

QUESTION:
"${question}"
`;

    const text = await callGemini(prompt);
    return text || "I don't have verified information about that requirement in the Jan-Setu knowledge base. Please check the official scheme source.";
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
  // Keyword extraction for smart matching
  const keywords = q
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !['what', 'which', 'where', 'when', 'help', 'about', 'from', 'with', 'have', 'there'].includes(word));

  const matched = schemes.filter(s => {
    const textToSearch = `${s.name} ${s.sector} ${s.description} ${s.teluguName || ''}`.toLowerCase();
    return keywords.some(kw => textToSearch.includes(kw));
  });

  if (lang === 'te') {
    if (matched.length > 0) {
      const top = matched.slice(0, 3);
      const schemeList = top.map(m => `• **${m.teluguName || m.name}** (${m.sector}): ${m.benefits.slice(0, 2).join('; ')}`).join('\n');
      return `మీ ప్రశ్నకు సంబంధించి జన్-సేతులో కనుగొనబడిన పథకాలు:\n\n${schemeList}\n\nమరిన్ని వివరాల కోసం 'పథకాలు శోధించండి' విభాగాన్ని చూడవచ్చు.`;
    }
    return `క్షమించండి, జన్-సేతు పరిజ్ఞాన వేదికలో మీ ప్రశ్నకు సంబంధించిన ఖచ్చితమైన సమాచారం లభించలేదు. దయచేసి అధికారిక పోర్టల్‌ను సంప్రదించండి.`;
  }

  if (matched.length > 0) {
    const top = matched.slice(0, 3);
    const schemeList = top.map(m => `### ${m.name} (${m.sector} Sector)\n- **Key Benefits:** ${m.benefits.join(', ')}\n- **Required Documents:** ${m.requiredDocuments.join(', ')}\n- **Official Source:** ${m.officialSource}`).join('\n\n');
    return `Here are the matching verified schemes found in Jan-Setu:\n\n${schemeList}\n\n*Note: Final verification and sanctioning is subject to respective government departmental rules.*`;
  }

  return `Thank you for your question. Jan-Setu has 30 verified schemes across Agriculture, Housing, Health, Social Welfare, and Livelihoods. You can explore details or test your eligibility under the Find Schemes tab.`;
}
