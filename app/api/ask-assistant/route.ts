import { NextRequest, NextResponse } from 'next/server';
import { answerCitizenQuestion } from '@/lib/ai/gemini';
import rawSchemes from '@/data/schemes.json';
import { Scheme } from '@/lib/storage/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, profile, lang } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question parameter is required' }, { status: 400 });
    }

    const answer = await answerCitizenQuestion(
      question,
      profile || { name: 'Citizen' },
      rawSchemes as Scheme[],
      lang || 'en'
    );

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error('API /api/ask-assistant error:', err);
    return NextResponse.json(
      { error: 'We couldn\'t answer your question right now. Please try again.' },
      { status: 500 }
    );
  }
}
