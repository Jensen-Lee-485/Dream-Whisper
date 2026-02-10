'use client';

import { useState, useEffect, useMemo } from 'react';
import { Globe, Sparkles, Clock } from 'lucide-react';

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

export default function CommunityFeed() {
  const [dreams, setDreams] = useState<SharedDream[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 模拟在线人数 = 实际数量 + 随机偏移
  const onlineCount = useMemo(() => {
    const base = Math.max(total, 1);
    return base + Math.floor(Math.random() * 80) + 48;
  }, [total]);

  useEffect(() => {
    fetch('/api/community')
      .then(res => res.json())
      .then(data => {
        setDreams(data.dreams || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins} 分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小时前`;
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* 顶部氛围区 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 backdrop-blur-md rounded-full border border-indigo-500/20 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span className="text-indigo-200/80 text-sm">
            此刻，共有 <span className="font-bold text-purple-300">{onlineCount}</span> 人正在这片星空下共享他们的梦境。
          </span>
        </div>
        <h2 className="text-2xl text-indigo-100 font-light tracking-wide mb-2">星网</h2>
        <p className="text-indigo-400/50 text-sm">来自不同造梦者的潜意识碎片</p>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-indigo-300/50 text-sm">正在连接星网...</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && dreams.length === 0 && (
        <div className="text-center py-20 bg-indigo-950/10 rounded-3xl border border-indigo-500/5 border-dashed">
          <Globe className="w-12 h-12 text-indigo-500/25 mx-auto mb-4" />
          <h3 className="text-lg text-indigo-200/70 mb-2">星网尚无连接</h3>
          <p className="text-indigo-400/40 text-sm">解析一个梦境后，点击"同步至星网"成为第一位造梦者</p>
        </div>
      )}

      {/* 梦境卡片列表 */}
      {!loading && dreams.length > 0 && (
        <div className="space-y-4">
          {dreams.map((dream) => (
            <div
              key={dream.id}
              className="bg-indigo-950/20 backdrop-blur-xl rounded-2xl border border-indigo-500/15 p-5 md:p-6 hover:border-purple-500/25 transition-all duration-300 group"
            >
              <div className="flex gap-4 md:gap-5">
                {/* 图片缩略图 */}
                {dream.imageUrl && (
                  <div className="hidden md:block flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-indigo-500/20">
                    <img
                      src={dream.imageUrl}
                      alt="梦境影像"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* 昵称 + 时间 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300/80 text-sm font-medium">{dream.nickname}</span>
                    <span className="text-indigo-500/40 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(dream.sharedAt)}
                    </span>
                  </div>

                  {/* 梦境摘要 */}
                  <p className="text-indigo-200/70 text-sm leading-relaxed line-clamp-2 mb-3">
                    {dream.dream}
                  </p>

                  {/* 情绪 + 符号标签 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {dream.emotional_tone && (
                      <span className="px-2.5 py-0.5 bg-purple-500/15 border border-purple-500/20 rounded-full text-[11px] text-purple-300/80">
                        {dream.emotional_tone}
                      </span>
                    )}
                    {dream.symbols.slice(0, 3).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-indigo-950/40 rounded-full text-[11px] text-indigo-400/60"
                      >
                        #{s.symbol}
                      </span>
                    ))}
                  </div>

                  {/* 心理洞察预览 */}
                  {dream.psychological_insight && (
                    <p className="mt-2.5 text-indigo-300/40 text-xs line-clamp-1 italic">
                      &ldquo;{dream.psychological_insight}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
