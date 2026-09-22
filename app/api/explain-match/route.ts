import { NextRequest, NextResponse } from 'next/server';
import { generateMatchExplanation } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, result, lang } = body;

    if (!profile || !result) {
      return NextResponse.json({ error: 'Profile and Result parameters are required' }, { status: 400 });
    }

    const explanation = await generateMatchExplanation(profile, result, lang || 'en');
    return NextResponse.json({ explanation });
  } catch (err: any) {
    console.error('API /api/explain-match error:', err);
    return NextResponse.json(
      { error: 'We couldn\'t generate an explanation right now. Please try again.' },
      { status: 500 }
    );
  }
}
