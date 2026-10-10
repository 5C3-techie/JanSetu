import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const lang = (formData.get('lang') as 'te-IN' | 'en-IN') || 'te-IN';

        if (!file) {
            return NextResponse.json(
                { error: 'No audio file provided in request.' },
                { status: 400 }
            );
        }

        // Maximum file size check: 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Audio file exceeds maximum size limit of 10MB.' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const audioBase64 = buffer.toString('base64');
        const mimeType = file.type || 'audio/webm';

        const transcript = await transcribeAudio(audioBase64, mimeType, lang);

        return NextResponse.json({
            success: true,
            transcript,
            lang,
        });
    } catch (err: any) {
        console.error('API /api/transcribe-audio error:', err);
        return NextResponse.json(
            {
                error: err.message || 'Audio transcription failed.',
                transcript: null,
            },
            { status: 500 }
        );
    }
}
