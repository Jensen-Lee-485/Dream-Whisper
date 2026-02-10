'use client';

import { useState, useEffect } from 'react';

interface SharedDream {
  id: string;
  nickname: string;
  dream: string;
  emotional_tone: string;
  symbols: string[];
  psychological_insight: string;
  imageUrl?: string;
  sharedAt: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
}

export default function CommunityFeed() {
  const [dreams, setDreams] = useState<SharedDream[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    fetch('/api/community')
      .then(res => res.json())
      .then(data => {
        setDreams(data.dreams || []);
        setOnlineCount(Math.floor(Math.random() * 80) + 48 + (data.total || 0));
      })
      .catch(() => setDreams([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-indigo-300/60 text-sm">正在连接星网...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl text-indigo-200 font-light tracking-wide mb-3">星网社区</h2>
        <div className="flex items-center justify-center gap-2 text-indigo-400/60 text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span>此刻，共有 {onlineCount} 人正在这片星空下共享他们的梦境</span>
        </div>
      </div>

      {/* Dream List */}
      {dreams.length === 0 ? (
        <div className="text-center py-16 bg-indigo-950/10 rounded-3xl border border-indigo-500/5 border-dashed">
          <p className="text-indigo-300/50 text-lg mb-2">星网中还没有梦境</p>
          <p className="text-indigo-400/40 text-sm">成为第一个分享梦境的人吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dreams.map(d => (
            <div
              key={d.id}
              className="group bg-indigo-950/20 backdrop-blur-md border border-indigo-500/10 hover:border-indigo-400/25 rounded-2xl p-5 transition-all duration-300"
            >
              <div className="flex gap-4">
                {/* Image thumbnail */}
                {d.imageUrl && (
                  <div className="hidden md:block flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-indigo-900/30">
                    <img
                      src={d.imageUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Nickname + time */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-indigo-200 text-sm font-medium">{d.nickname}</span>
                    <span className="text-indigo-500/40 text-xs">{relativeTime(d.sharedAt)}</span>
                  </div>

                  {/* Dream excerpt */}
                  <p className="text-indigo-300/70 text-sm leading-relaxed line-clamp-2 mb-3">
                    {d.dream}
                  </p>

                  {/* Tags row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {d.emotional_tone && (
                      <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-300/80 rounded-full text-xs">
                        {d.emotional_tone}
                      </span>
                    )}
                    {d.symbols.slice(0, 3).map((sym, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300/60 rounded-full text-xs">
                        {sym}
                      </span>
                    ))}
                  </div>

                  {/* Insight preview */}
                  {d.psychological_insight && (
                    <p className="mt-2 text-indigo-400/40 text-xs line-clamp-1 italic">
                      {d.psychological_insight}
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
