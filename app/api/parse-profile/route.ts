import { NextRequest, NextResponse } from 'next/server';
import { parseProfileFromNL } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const extracted = await parseProfileFromNL(text);
    return NextResponse.json({ profile: extracted });
  } catch (err: any) {
    console.error('API /api/parse-profile error:', err);
    return NextResponse.json(
      { error: 'We couldn\'t process your request right now. Please try again.' },
      { status: 500 }
    );
  }
}
