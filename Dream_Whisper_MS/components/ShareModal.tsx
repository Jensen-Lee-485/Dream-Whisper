'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Shuffle } from 'lucide-react';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (nickname: string) => void;
}

const NICKNAMES = [
  '星际漫游者', '月光拾梦人', '银河观星者', '深海潜行者',
  '极光守望者', '星尘收集者', '暗夜寻光者', '虹桥漫步者',
  '云端造梦师', '星河摆渡人', '梦境编织者', '时光旅行者',
  '星辰追逐者', '幻境探索家', '银月行者', '夜空绘梦者',
  '流星许愿人', '星云旅者', '晨曦猎人', '彗星骑士',
];

function randomNickname() {
  return NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
}

export default function ShareModal({ open, onClose, onConfirm }: ShareModalProps) {
  const [nickname, setNickname] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNickname(randomNickname());
      setTimeout(() => inputRef.current?.select(), 100);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      {/* 轻量遮罩 */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* 弹窗 */}
      <div
        className="relative w-full max-w-md bg-indigo-950/60 backdrop-blur-2xl rounded-3xl border border-indigo-500/25 p-8 shadow-[0_8px_60px_rgba(99,102,241,0.2)] animate-[scaleIn_0.25s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-indigo-400/50 hover:text-indigo-200 hover:bg-indigo-500/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="text-3xl mb-3">&#x2728;</div>
          <h3 className="text-lg text-indigo-100 font-medium mb-1">投递到集体潜意识</h3>
          <p className="text-indigo-300/50 text-sm">选择一个匿名身份，让梦境汇入星网</p>
        </div>

        <div className="mb-6">
          <label className="block text-indigo-300/70 text-sm mb-2">如何称呼这位造梦者？</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={20}
              className="flex-1 bg-indigo-950/40 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-indigo-100 text-sm placeholder:text-indigo-500/30 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_12px_rgba(139,92,246,0.15)] transition-all"
              placeholder="不填则默认为「无名氏」"
            />
            <button
              onClick={() => setNickname(randomNickname())}
              className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 transition-all"
              title="换一个"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-indigo-300/60 bg-indigo-950/30 border border-indigo-500/10 hover:bg-indigo-950/50 transition-all"
          >
            取消
          </button>
          <button
            onClick={() => {
              const name = nickname.trim() || '无名氏';
              onConfirm(name);
            }}
            disabled={false}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
          >
            确认同步
          </button>
        </div>
      </div>
    </div>
  );
}
