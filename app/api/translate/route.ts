import { NextRequest, NextResponse } from 'next/server';
import { translateSpeechText, GEMINI_MODEL } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sourceLang, targetLang } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { error: 'Speech text parameter is required' },
        { status: 400 }
      );
    }

    if (!targetLang || !['en', 'te'].includes(targetLang)) {
      return NextResponse.json(
        { error: "Invalid targetLang. Must be 'en' or 'te'" },
        { status: 400 }
      );
    }

    const result = await translateSpeechText({
      text: text.trim(),
      sourceLang: sourceLang === 'te' || sourceLang === 'en' ? sourceLang : 'auto',
      targetLang,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /api/translate error:', err);
    return NextResponse.json(
      {
        error: err?.message || 'Translation failed. Please check Gemini API configuration.',
        model: GEMINI_MODEL,
      },
      { status: 500 }
    );
  }
}

