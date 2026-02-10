import { NextResponse } from 'next/server';

interface SharedDream {
  id: string;
  nickname: string;
  dream: string;
  emotional_tone: string;
  symbols: { symbol: string }[];
  psychological_insight: string;
  personality_traits?: {
    creativity: number;
    logic: number;
    emotion: number;
    spirituality: number;
    realism: number;
  };
  imageUrl?: string;
  sharedAt: string;
}

// 模块级内存存储（容器重启清空）
const sharedDreams: SharedDream[] = [];

export async function GET() {
  return NextResponse.json({
    dreams: sharedDreams,
    total: sharedDreams.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nickname,
      dream,
      emotional_tone,
      symbols,
      psychological_insight,
      personality_traits,
      imageUrl,
    } = body;

    if (!dream || !nickname) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const record: SharedDream = {
      id: Date.now().toString(),
      nickname,
      dream: dream.slice(0, 200),
      emotional_tone: emotional_tone || '',
      symbols: (symbols || []).slice(0, 5).map((s: { symbol: string }) => ({ symbol: s.symbol })),
      psychological_insight: (psychological_insight || '').slice(0, 300),
      personality_traits,
      imageUrl,
      sharedAt: new Date().toISOString(),
    };

    sharedDreams.unshift(record);

    // 最多保留 200 条
    if (sharedDreams.length > 200) {
      sharedDreams.length = 200;
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch {
    return NextResponse.json({ error: '分享失败' }, { status: 500 });
  }
}
