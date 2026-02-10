'use client';

import { useState } from 'react';

interface AnalysisData {
  symbols: { symbol: string; meaning: string }[];
  emotional_tone: string;
  psychological_insight: string;
  life_connection: string;
  suggestions: string[];
  image_prompt: string;
}

interface DreamSegment {
  id: string;
  content: string;
  timestamp: Date;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 根据情绪获取背景样式
const getBackgroundClass = (emotion: string, hoveredEmotion: string) => {
  if (hoveredEmotion) {
    switch (hoveredEmotion) {
      case '平静': return 'from-slate-900 via-blue-900 to-slate-900';
      case '快乐': return 'from-slate-900 via-yellow-900 to-slate-900';
      case '焦虑': return 'from-slate-900 via-red-900 to-slate-900';
      case '恐惧': return 'from-slate-900 via-purple-900 to-slate-900';
      case '兴奋': return 'from-slate-900 via-orange-900 to-slate-900';
      case '困惑': return 'from-slate-900 via-gray-900 to-slate-900';
      case '悲伤': return 'from-slate-900 via-blue-900 to-slate-900';
      case '愤怒': return 'from-slate-900 via-red-900 to-slate-900';
      case '浪漫': return 'from-slate-900 via-pink-900 to-slate-900';
      case '神秘': return 'from-slate-900 via-purple-900 to-slate-900';
      default: return 'from-slate-900 via-purple-950 to-slate-900';
    }
  }
  if (emotion) {
    switch (emotion) {
      case '平静': return 'from-slate-900 via-blue-900 to-slate-900';
      case '快乐': return 'from-slate-900 via-yellow-900 to-slate-900';
      case '焦虑': return 'from-slate-900 via-red-900 to-slate-900';
      case '恐惧': return 'from-slate-900 via-purple-900 to-slate-900';
      case '兴奋': return 'from-slate-900 via-orange-900 to-slate-900';
      case '困惑': return 'from-slate-900 via-gray-900 to-slate-900';
      case '悲伤': return 'from-slate-900 via-blue-900 to-slate-900';
      case '愤怒': return 'from-slate-900 via-red-900 to-slate-900';
      case '浪漫': return 'from-slate-900 via-pink-900 to-slate-900';
      case '神秘': return 'from-slate-900 via-purple-900 to-slate-900';
      default: return 'from-slate-900 via-purple-950 to-slate-900';
    }
  }
  return 'from-slate-900 via-purple-950 to-slate-900';
};

// 获取星星动画样式
const getStarStyle = (emotion: string, hoveredEmotion: string) => {
  const isHovered = !!hoveredEmotion;
  const emotionValue = hoveredEmotion || emotion;
  
  let colorClass = 'bg-white/30';
  let animationClass = 'animate-pulse';
  
  if (isHovered) {
    switch (emotionValue) {
      case '快乐': 
        colorClass = 'bg-yellow-300/40';
        animationClass = 'animate-bounce';
        break;
      case '焦虑': 
        colorClass = 'bg-red-300/40';
        animationClass = 'animate-pulse-fast';
        break;
      case '兴奋': 
        colorClass = 'bg-orange-300/40';
        animationClass = 'animate-bounce';
        break;
      case '浪漫': 
        colorClass = 'bg-pink-300/40';
        animationClass = 'animate-ping';
        break;
      default: 
        colorClass = 'bg-white/30';
        animationClass = 'animate-pulse';
    }
  } else if (emotion) {
    switch (emotion) {
      case '快乐': 
        colorClass = 'bg-yellow-400/20';
        break;
      case '焦虑': 
        colorClass = 'bg-red-400/20';
        animationClass = 'animate-pulse';
        break;
      case '恐惧': 
        colorClass = 'bg-purple-400/20';
        animationClass = 'animate-pulse-fast';
        break;
      case '神秘': 
        colorClass = 'bg-indigo-400/20';
        break;
    }
  }
  
  return { colorClass, animationClass };
};

export default function Home() {
  // 应用状态
  const [activeScreen, setActiveScreen] = useState<'home' | 'analyze' | 'history'>('home');
  const [hoveredEmotion, setHoveredEmotion] = useState<string>('');
  
  // 分析相关的状态
  const [currentDreamSegment, setCurrentDreamSegment] = useState<string>('');
  const [currentEmotionalTone, setCurrentEmotionalTone] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [media, setMedia] = useState<{imageUrl: string, videoUrl: string} | null>(null);
  const [isLoading, setIsLoading] = useState({ analysis: false, media: false });

  // 用户的梦境历史
  const [dreamHistory, setDreamHistory] = useState<any[]>([
    // 模拟的梦境历史数据
    { 
      id: 1, 
      title: "云端之城",
      emotional_tone: "兴奋",
      date: new Date("2026-01-15"),
      segments: [{id: "1", content: "我在一朵巨大的白云上", timestamp: new Date("2026-01-15")}], 
      status: "completed",
      results: {} // 示例：只存储简单状态标识
    }
  ]);
  const [currentChatInput, setCurrentChatInput] = useState("");

  // 尝试与新式调优方案完成该环节后的主分离开