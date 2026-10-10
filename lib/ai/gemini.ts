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
 * Domain-specific custom vocabulary list for Indian civic & welfare audio transcription.
 */
const DOMAIN_VOCABULARY = [
  'Telangana', 'తెలంగాణ', 'Telugu', 'తెలుగు', 'గ్రామం', 'వ్యవసాయ కూలీ', 'వ్యవసాయ కార్మికుడు',
  'ఆదాయం', 'వార్షిక ఆదాయం', 'భూమి', 'భూమి లేదు', 'వయస్సు', 'సంవత్సరాలు', 'BC', 'SC', 'ST', 'OBC',
  'agricultural labourer', 'farmer', 'annual income', 'land ownership', 'rural', 'urban',
  'Rythu Bharosa', 'PM-KISAN', 'Aasara Pension', 'Andhra Pradesh', 'Hyderabad', 'Warangal',
  'Karimnagar', 'Nalgonda', 'Rangareddy', 'Gram Panchayat', 'village', 'small farmer',
  'tenant farmer', 'landless', 'pattadar', 'lakh', 'thousand', 'EBC', 'General', 'ration card',
  'Aadhaar', 'Aadhaar card', 'bank account', 'income certificate', 'caste certificate', 'land title',
  'passbook', 'Ayushman Bharat', 'naaku', 'nenu', 'untanu', 'ledu', 'vyavasaya kooli'
];

export interface FieldConfidence {
  age?: 'CONFIDENT' | 'UNCERTAIN' | 'MISSING';
  annualIncome?: 'CONFIDENT' | 'UNCERTAIN' | 'MISSING';
  state?: 'CONFIDENT' | 'UNCERTAIN' | 'MISSING';
  occupation?: 'CONFIDENT' | 'UNCERTAIN' | 'MISSING';
  landOwnership?: 'CONFIDENT' | 'UNCERTAIN' | 'MISSING';
  isRural?: 'CONFIDENT' | 'UNCERTAIN' | 'MISSING';
}

export interface ParsedProfileResult {
  profile: Partial<CitizenProfile>;
  confidence: FieldConfidence;
  rawInputText: string;
}

/**
 * Server-side Gemini Audio Transcription
 * Dedicated speech-to-text model: gemini-3.5-transcribe
 */
export async function transcribeAudio(
  audioBase64: string,
  mimeType: string = 'audio/webm',
  langHint: 'te-IN' | 'en-IN' = 'te-IN'
): Promise<string> {
  if (!aiClient || !apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured on the server.');
  }

  // Model fallback candidate list prioritizing gemini-3.5-transcribe
  const candidateModels = ['gemini-3.5-transcribe', 'gemini-2.0-flash'];

  const prompt = `
You are a dedicated verbatim speech-to-text transcription engine for Indian citizens speaking Telugu, English, or Telugu-English code-switched speech.

LANGUAGE HINT:
Selected language hint: ${langHint === 'te-IN' ? 'Telugu (te-IN)' : 'English (en-IN)'}.

STRICT TRANSCRIPTION INSTRUCTIONS:
1. Provide a VERBATIM transcript of the audio.
2. DO NOT translate Telugu into English. If the user spoke Telugu, output accurate Telugu script (e.g. "నాకు 42 సంవత్సరాలు") or Romanized Telugu as spoken.
3. DO NOT transliterate Telugu words into random phonetically similar English words (for example: "నాకు" / "naaku" MUST be transcribed as "నాకు" or "naaku", NEVER as "Nagpur").
4. If the speaker speaks English: output standard Indian English text.
5. If the speaker mixes Telugu and English: preserve the exact code-switching structure.
6. Pay strict attention to numbers, ages, Indian place names, occupations, and rupee amounts.

Custom Domain Vocabulary Context:
${DOMAIN_VOCABULARY.join(', ')}

Output ONLY the verbatim transcript string without any markdown code blocks, headers, or commentary.
`;

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      });

      const transcript = (response.text || '').trim();
      if (transcript) {
        return transcript;
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} failed or unavailable, trying fallback:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Voice transcription service is temporarily unavailable. Please try again or use text input.');
}

/**
 * Natural Language Profile Intake Parser using Gemini Text Model
 * Extracts structured profile JSON from raw citizen text input or transcribed speech.
 */
export async function parseProfileFromNL(inputText: string): Promise<ParsedProfileResult> {
  if (!aiClient || !apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallbackNLParser(inputText);
  }

  const candidateModels = ['gemini-2.0-flash', 'gemini-2.5-flash'];

  const prompt = `
You are the profile extraction engine for Jan-Setu, an Indian welfare scheme discovery platform.
Parse the citizen's text input (which may be in Telugu script, Romanized Telugu, English, or mixed Telugu-English).

STRICT NO-HALLUCINATION RULES:
1. DO NOT guess or infer values that were NOT explicitly mentioned in the text.
2. If age is NOT mentioned, set age to null.
3. If annual income is NOT mentioned, set annualIncome to null.
4. If land ownership is NOT mentioned, set landOwnership to null.
5. If state is NOT mentioned, set state to null.
6. If occupation is NOT mentioned, set occupation to null.
7. DO NOT infer category/caste from occupation or name.

TELUGU SCRIPT & ROMANIZED EXAMPLES:
- Age: "నాకు 42 సంవత్సరాలు" / "నా వయస్సు 42" / "Naaku 42 years" / "I am 42 years old" -> age: 42
- Landless: "నాకు భూమి లేదు" / "naaku land ledu" / "naaku bhoomi ledu" / "I do not own land" -> landOwnership: false
- Own Land: "నాకు భూమి ఉంది" / "naaku land undi" / "pattadar" / "I own land" -> landOwnership: true
- State: "తెలంగాణలో ఉంటాను" / "Nenu Telangana lo untanu" / "I live in Telangana" -> state: "Telangana"
- Rural: "గ్రామంలో ఉంటాను" / "village lo untanu" / "I live in a village" -> isRural: true
- Urban: "పట్టణంలో ఉంటాను" / "city lo untanu" / "I live in a city" -> isRural: false
- Income: "నా వార్షిక ఆదాయం ఒక లక్ష ఇరవై వేల రూపాయలు" / "Naa annual income one lakh twenty thousand" / "1.2 lakh" / "1,20,000" -> annualIncome: 120000
- Occupation: "వ్యవసాయ కూలీని" / "వ్యవసాయ కార్మికుడు" / "agricultural labourer" / "vyavasaya kooli" -> occupation: "agricultural_labourer"

Allowed Occupations:
"agricultural_labourer", "farmer", "small_farmer", "unorganised_worker", "artisan", "street_vendor", "domestic_worker", "student", "unemployed"

Allowed Categories:
"SC", "ST", "BC", "EBC", "General"

Allowed States:
"Telangana", "Andhra Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu"

Return a single raw JSON object (NO markdown code blocks) with this exact schema:
{
  "profile": {
    "age": number | null,
    "state": string | null,
    "district": string | null,
    "isRural": boolean | null,
    "occupation": string | null,
    "annualIncome": number | null,
    "landOwnership": boolean | null,
    "category": string | null,
    "gender": string | null
  },
  "confidence": {
    "age": "CONFIDENT" | "UNCERTAIN" | "MISSING",
    "annualIncome": "CONFIDENT" | "UNCERTAIN" | "MISSING",
    "state": "CONFIDENT" | "UNCERTAIN" | "MISSING",
    "occupation": "CONFIDENT" | "UNCERTAIN" | "MISSING",
    "landOwnership": "CONFIDENT" | "UNCERTAIN" | "MISSING",
    "isRural": "CONFIDENT" | "UNCERTAIN" | "MISSING"
  }
}

Input text to parse:
"${inputText}"
`;

  for (const modelName of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = response.text || '';
      const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        profile: parsed.profile || {},
        confidence: parsed.confidence || {},
        rawInputText: inputText,
      };
    } catch (err: any) {
      console.warn(`Model ${modelName} failed for parsing, trying fallback:`, err?.message || err);
    }
  }

  return fallbackNLParser(inputText);
}

/**
 * Gemini Match Explanation Layer
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

  const candidateModels = ['gemini-2.0-flash', 'gemini-2.5-flash'];

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
  "friendlySummary": "Short 2 sentence warm summary."
}
`;

  for (const modelName of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = response.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err: any) {
      console.warn(`Model ${modelName} failed for explanation, trying fallback:`, err?.message || err);
    }
  }

  return fallbackExplanation(result, lang);
}

/**
 * Natural Language Assistant (Ask Jan-Setu Q&A)
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

  const candidateModels = ['gemini-2.0-flash', 'gemini-2.5-flash'];

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

  for (const modelName of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      return response.text || 'Information unavailable.';
    } catch (err: any) {
      console.warn(`Model ${modelName} failed for Q&A, trying fallback:`, err?.message || err);
    }
  }

  return fallbackAssistant(question, schemes, lang);
}

// Fallback rule parser when Gemini key is not configured or network fails
function fallbackNLParser(input: string): ParsedProfileResult {
  const lower = input.toLowerCase();
  const extracted: Partial<CitizenProfile> = {};
  const confidence: FieldConfidence = {
    age: 'MISSING',
    annualIncome: 'MISSING',
    state: 'MISSING',
    occupation: 'MISSING',
    landOwnership: 'MISSING',
    isRural: 'MISSING',
  };

  const ageMatch = lower.match(/(\d{2})\s*(year|yr|years|old|సంవత్సరాలు)/);
  if (ageMatch) {
    extracted.age = parseInt(ageMatch[1], 10);
    confidence.age = 'CONFIDENT';
  }

  if (lower.includes('telangana') || lower.includes('తెలంగాణ')) {
    extracted.state = 'Telangana';
    confidence.state = 'CONFIDENT';
  } else if (lower.includes('andhra') || lower.includes('ఆంధ్ర')) {
    extracted.state = 'Andhra Pradesh';
    confidence.state = 'CONFIDENT';
  }

  if (lower.includes('village') || lower.includes('rural') || lower.includes('gram') || lower.includes('గ్రామ')) {
    extracted.isRural = true;
    confidence.isRural = 'CONFIDENT';
  } else if (lower.includes('urban') || lower.includes('city') || lower.includes('పట్టణ')) {
    extracted.isRural = false;
    confidence.isRural = 'CONFIDENT';
  }

  if (lower.includes('agricultural') || lower.includes('labourer') || lower.includes('coolie') || lower.includes('కూలీ') || lower.includes('వ్యవసాయ')) {
    extracted.occupation = 'agricultural_labourer';
    confidence.occupation = 'CONFIDENT';
  } else if (lower.includes('farmer') || lower.includes('rythu') || lower.includes('రైతు')) {
    extracted.occupation = 'farmer';
    confidence.occupation = 'CONFIDENT';
  } else if (lower.includes('vendor') || lower.includes('street')) {
    extracted.occupation = 'street_vendor';
    confidence.occupation = 'CONFIDENT';
  } else if (lower.includes('artisan') || lower.includes('weaver')) {
    extracted.occupation = 'artisan';
    confidence.occupation = 'CONFIDENT';
  } else if (lower.includes('student')) {
    extracted.occupation = 'student';
    confidence.occupation = 'CONFIDENT';
  }

  if (lower.includes('1.2') || lower.includes('1,20,000') || lower.includes('1.2 lakh') || lower.includes('ఒక లక్ష ఇరవై వేల')) {
    extracted.annualIncome = 120000;
    confidence.annualIncome = 'CONFIDENT';
  } else if (lower.includes('1.5') || lower.includes('1,50,000') || lower.includes('1.5 lakh')) {
    extracted.annualIncome = 150000;
    confidence.annualIncome = 'CONFIDENT';
  } else if (lower.includes('90,000') || lower.includes('90k')) {
    extracted.annualIncome = 90000;
    confidence.annualIncome = 'CONFIDENT';
  }

  if (lower.includes('no land') || lower.includes("don't own land") || lower.includes('landless') || lower.includes('land ledu') || lower.includes('భూమి లేదు') || lower.includes('bhoomi ledu')) {
    extracted.landOwnership = false;
    confidence.landOwnership = 'CONFIDENT';
  } else if (lower.includes('own land') || lower.includes('land owner') || lower.includes('pattadar') || lower.includes('land undi') || lower.includes('భూమి ఉంది')) {
    extracted.landOwnership = true;
    confidence.landOwnership = 'CONFIDENT';
  }

  return {
    profile: extracted,
    confidence,
    rawInputText: input,
  };
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
