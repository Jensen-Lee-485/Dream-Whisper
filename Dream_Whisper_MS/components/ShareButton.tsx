'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import ShareModal from './ShareModal';

interface ShareButtonProps {
  dreamId?: string;
  dream: string;
  analysis: {
    symbols: { symbol: string; meaning: string }[];
    emotional_tone: string;
    psychological_insight: string;
    personality_traits?: {
      creativity: number;
      logic: number;
      emotion: number;
      spirituality: number;
      realism: number;
    };
  };
  imageUrl?: string;
  onNavigateCommunity?: () => void;
}

const SHARED_KEY = 'dream_whisper_shared';

function getSharedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SHARED_KEY) || '[]');
  } catch {
    return [];
  }
}

function markAsShared(id: string) {
  const ids = getSharedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(SHARED_KEY, JSON.stringify(ids));
  }
}

export default function ShareButton({ dreamId, dream, analysis, imageUrl, onNavigateCommunity }: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    if (dreamId) {
      setShared(getSharedIds().includes(dreamId));
    }
  }, [dreamId]);

  const handleClick = () => {
    if (shared || submitting) return;
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    setModalOpen(true);
  };

  const handleConfirm = async (nickname: string) => {
    setModalOpen(false);
    setSubmitting(true);

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          dream,
          emotional_tone: analysis.emotional_tone,
          symbols: analysis.symbols,
          psychological_insight: analysis.psychological_insight,
          personality_traits: analysis.personality_traits,
          imageUrl,
        }),
      });

      if (!res.ok) throw new Error('分享失败');

      if (dreamId) markAsShared(dreamId);
      setShared(true);
      setShowStars(true);
      setTimeout(() => setShowStars(false), 2000);
    } catch (e) {
      console.error('分享错误:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col items-center gap-3 my-6">
        {/* 星光粒子动画 */}
        {showStars && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute w-1 h-1 bg-purple-300 rounded-full animate-[starFloat_1.5s_ease-out_forwards]"
                style={{
                  left: `${(i - 4) * 12}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={shared || submitting}
          className={`relative overflow-hidden px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-500 ${
            shared
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 cursor-default'
              : submitting
              ? 'bg-indigo-500/20 border border-indigo-500/20 text-indigo-300/50 cursor-wait'
              : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-purple-500/30 text-purple-200 hover:from-indigo-500/30 hover:to-purple-500/30 hover:scale-105 active:scale-95'
          }`}
          style={!shared && !submitting ? { animation: 'breathe 3s ease-in-out infinite' } : undefined}
        >
          {/* 涟漪效果 */}
          {ripple && (
            <span className="absolute inset-0 animate-[ripple_0.6s_ease-out] rounded-2xl border-2 border-purple-400/50" />
          )}

          <span className="relative z-10 flex items-center gap-2">
            {shared ? (
              <>
                <Check className="w-4 h-4" />
                已同步至星空
              </>
            ) : submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                投递中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                投递到集体潜意识
              </>
            )}
          </span>
        </button>

        {/* 成功后跳转社区按钮 */}
        {shared && onNavigateCommunity && (
          <button
            onClick={onNavigateCommunity}
            className="flex items-center gap-1.5 text-xs text-indigo-400/70 hover:text-indigo-300 transition-colors"
            style={{ animation: 'fadeIn 0.5s ease-out' }}
          >
            前往梦网社区查看
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <ShareModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
