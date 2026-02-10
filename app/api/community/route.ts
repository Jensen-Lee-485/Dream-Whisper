import { NextRequest, NextResponse } from 'next/server';

interface SharedDream {
  id: string;
  nickname: string;
  dream: string;
  emotional_tone: string;
  symbols: string[];
  psychological_insight: string;
  personality_traits?: Record<string, number>;
  imageUrl?: string;
  sharedAt: string;
}

const sharedDreams: SharedDream[] = [];
const MAX_DREAMS = 200;

export async function GET() {
  return NextResponse.json({
    dreams: sharedDreams,
    total: sharedDreams.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, dream, emotional_tone, symbols, psychological_insight, personality_traits, imageUrl } = body;

    if (!nickname || !dream) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const record: SharedDream = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      nickname: String(nickname).slice(0, 20),
      dream: String(dream).slice(0, 200),
      emotional_tone: String(emotional_tone || '').slice(0, 50),
      symbols: Array.isArray(symbols) ? symbols.slice(0, 5).map((s: string) => String(s).slice(0, 30)) : [],
      psychological_insight: String(psychological_insight || '').slice(0, 300),
      personality_traits,
      imageUrl: imageUrl || undefined,
      sharedAt: new Date().toISOString(),
    };

    sharedDreams.unshift(record);
    if (sharedDreams.length > MAX_DREAMS) {
      sharedDreams.length = MAX_DREAMS;
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch {
    return NextResponse.json({ error: '分享失败' }, { status: 500 });
  }
}
