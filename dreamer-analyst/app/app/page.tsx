'use client';

import { useState } from 'react';
import DreamInput from '@/components/DreamInput';
import AnalysisResult from '@/components/AnalysisResult';
import DreamMedia from '@/components/DreamMedia';

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

export default function Home() {
  const [dreamSegments, setDreamSegments] = useState<DreamSegment[]>([{ id: '1', content: '', timestamp: new Date() }]);
  const [currentEmotionalTone, setCurrentEmotionalTone] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    analyze: false,
    image: false,
    video: false,
    aiQuestion: false,
  });
  
  // AI问答相关状态
  const [showAiQuestions, setShowAiQuestions] = useState(false);
  const [currentAiQuestion, setCurrentAiQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showStartAnalysisButton, setShowStartAnalysisButton] = useState(false);
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);
  const [showNewAnalysisButton, setShowNewAnalysisButton] = useState(false);

  // 添加新的梦境片段
  const addDreamSegment = () => {
    const newSegment: DreamSegment = {
      id: Date.now().toString(),
      content: '',
      timestamp: new Date()
    };
    setDreamSegments([...dreamSegments, newSegment]);
  };

  // 更新梦境片段内容
  const updateDreamSegment = (id: string, content: string) => {
    setDreamSegments(dreamSegments.map(segment => 
      segment.id === id ? { ...segment, content } : segment
    ));
  };

  // 删除梦境片段
  const removeDreamSegment = (id: string) => {
    if (dreamSegments.length > 1) {
      setDreamSegments(dreamSegments.filter(segment => segment.id !== id));
    }
  };

  // 合并所有梦境片段为一个字符串
  const getAllDreamContent = (): string => {
    return dreamSegments
      .filter(segment => segment.content.trim() !== '')
      .map(segment => segment.content)
      .join('\n\n');
  };

  // 显示确认模态框
  const handleShowConfirmModal = () => {
    if (getAllDreamContent().trim() === '') {
      setError('请先输入梦境内容');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // 确认并开始分析
  const handleConfirmAndAnalyze = async () => {
    setIsConfirmModalOpen(false);
    await handleAnalyze();
  };

  // 取消确认
  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  // 解析梦境
  const handleAnalyze = async () => {
    setError('');
    setLoading((prev) => ({ ...prev, analyze: true }));
    setAnalysis(null);
    setImageUrl('');
    setVideoUrl('');

    try {
      const fullDream = getAllDreamContent();
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dream: fullDream,
          emotional_tone: currentEmotionalTone
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '分析失败');
      }

      setAnalysis(data);
      setShowNewAnalysisButton(true); // 显示新分析按钮
    } catch (err) {
      console.error('分析错误:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        setError(JSON.stringify(err));
      } else {
        setError('分析过程中出现错误');
      }
    } finally {
      setLoading((prev) => ({ ...prev, analyze: false }));
    }
  };

  // 生成图像
  const handleGenerateImage = async () => {
    if (!analysis?.image_prompt) return;

    setLoading((prev) => ({ ...prev, image: true }));
    setError('');

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: analysis.image_prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '图像生成失败');
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      console.error('图像生成错误:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        setError(JSON.stringify(err));
      } else {
        setError('图像生成过程中出现错误');
      }
    } finally {
      setLoading((prev) => ({ ...prev, image: false }));
    }
  };

  // 生成视频
  const handleGenerateVideo = async () => {
    if (!imageUrl) return;

    setLoading((prev) => ({ ...prev, video: true }));
    setError('');

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          prompt: analysis?.image_prompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '视频生成失败');
      }

      setVideoUrl(data.videoUrl);
    } catch (err) {
      console.error('视频生成错误:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        setError(JSON.stringify(err));
      } else {
        setError('视频生成过程中出现错误');
      }
    } finally {
      setLoading((prev) => ({ ...prev, video: false }));
    }
  };

  // 显示AI问题询问界面
  const handleStartAiQuestions = async () => {
    if (getAllDreamContent().trim() === '') {
      setError('请先输入梦境内容');
      return;
    }

    setError('');
    setLoading(prev => ({ ...prev, aiQuestion: true }));

    try {
      // 发送初始梦境内容给AI，让它提出问题
      const res = await fetch('/api/dream-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dream: getAllDreamContent(),
          emotional_tone: currentEmotionalTone
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '获取AI问题失败');
      }

      // 设置AI的问题
      setCurrentAiQuestion(data.question || data.next_question || '请描述更多关于这个梦境的细节');
      setShowAiQuestions(true);
      
      // 添加AI消息到聊天记录
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.question || data.next_question || '请描述更多关于这个梦境的细节',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI问题获取错误:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取AI问题时出现错误');
      }
    } finally {
      setLoading(prev => ({ ...prev, aiQuestion: false }));
    }
  };

  // 回答AI问题
  const handleAnswerQuestion = async (answer: string) => {
    if (!answer.trim()) return;

    // 添加用户回答到消息记录
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setLoading(prev => ({ ...prev, aiQuestion: true }));

    try {
      // 发送用户回答给AI，获取下一个问题或分析选项
      const res = await fetch('/api/dream-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dream: getAllDreamContent(),
          emotional_tone: currentEmotionalTone,
          user_answer: answer,
          conversation_history: messages.concat(userMessage)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '处理答案失败');
      }

      // 处理AI的响应
      if (data.ask_for_analysis) {
        // 如果AI认为已经收集了足够的细节，询问是否开始分析
        setCurrentAiQuestion(data.ask_for_analysis);
        
        // 添加AI消息到聊天记录
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.ask_for_analysis,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // 显示开始分析按钮
        setShowStartAnalysisButton(true);
      } else if (data.next_question || data.question) {
        // 如果AI还有问题要问
        const nextQuestion = data.next_question || data.question;
        setCurrentAiQuestion(nextQuestion);
        
        // 添加AI消息到聊天记录
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: nextQuestion,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // 兜底处理：如果没有任何有效字段，显示错误信息
        setError('AI响应格式异常，请重试');
        setCurrentAiQuestion('抱歉，我没有理解您的回答。请重新描述您的梦境细节。');
        
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，我没有理解您的回答。请重新描述您的梦境细节。',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('处理答案错误:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('处理答案时出现错误');
      }
    } finally {
      setLoading(prev => ({ ...prev, aiQuestion: false }));
    }
  };

  // 结束AI问答，开始分析
  const handleStartAnalysisAfterQuestions = async () => {
    setLoading(prev => ({ ...prev, analyze: true }));
    setError('');

    try {
      // 合并原始梦境和AI问答内容
      const fullDream = getAllDreamContent() + '\n\n梦境补充信息：\n' +
        messages
          .filter(msg => msg.role === 'user')
          .map(msg => `- ${msg.content}`)
          .join('\n');

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dream: fullDream,
          emotional_tone: currentEmotionalTone
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '分析失败');
      }

      setAnalysis(data);
      setShowAiQuestions(false);
      setShowStartAnalysisButton(false);
      setShowNewAnalysisButton(true);
    } catch (err) {
      console.error('分析错误:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('分析过程中出现错误');
      }
    } finally {
      setLoading(prev => ({ ...prev, analyze: false }));
    }
  };

  // 开始新的梦境分析
  const handleStartNewAnalysis = () => {
    // 重置所有状态
    setDreamSegments([{ id: '1', content: '', timestamp: new Date() }]);
    setCurrentEmotionalTone('');
    setAnalysis(null);
    setImageUrl('');
    setVideoUrl('');
    setShowAiQuestions(false);
    setCurrentAiQuestion('');
    setMessages([]);
    setUserAnswer('');
    setShowStartAnalysisButton(false);
    setShowNewAnalysisButton(false);
    setError('');
  };

  // 根据情绪获取背景类名
  const getBackgroundClass = (emotion: string | null) => {
    // 选定情绪后背景保持固定不变
    const baseClass = 'from-slate-900 via-purple-950 to-slate-900';
    
    if (!emotion) return baseClass;
    
    const emotionClasses: Record<string, string> = {
      '平静': 'from-blue-900 via-blue-800 to-indigo-900',
      '快乐': 'from-yellow-900 via-orange-800 to-red-900',
      '焦虑': 'from-red-900 via-pink-800 to-purple-900',
      '恐惧': 'from-purple-900 via-gray-800 to-black',
      '兴奋': 'from-pink-900 via-red-800 to-orange-900',
      '困惑': 'from-gray-900 via-blue-800 to-purple-900',
      '悲伤': 'from-blue-900 via-indigo-800 to-gray-900',
      '愤怒': 'from-red-900 via-orange-800 to-yellow-900',
      '浪漫': 'from-pink-900 via-purple-800 to-indigo-900',
      '神秘': 'from-indigo-900 via-purple-800 to-pink-900',
    };
    
    return emotionClasses[emotion] || baseClass;
  };

  // 根据情绪获取星星样式
  const getStarStyle = (emotion: string | null) => {
    if (!emotion) return {};
    
    const starStyles: Record<string, any> = {
      '平静': { 
        backgroundColor: 'rgba(100, 200, 255, 0.3)',
        animationName: 'pulse',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '快乐': { 
        backgroundColor: 'rgba(255, 220, 100, 0.4)',
        animationName: 'bounce',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '焦虑': { 
        backgroundColor: 'rgba(255, 100, 100, 0.4)',
        animationName: 'pulse',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '恐惧': { 
        backgroundColor: 'rgba(180, 100, 255, 0.3)',
        animationName: 'twinkle',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '兴奋': { 
        backgroundColor: 'rgba(255, 150, 150, 0.4)',
        animationName: 'bounce',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '困惑': { 
        backgroundColor: 'rgba(150, 150, 255, 0.3)',
        animationName: 'pulse',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '悲伤': { 
        backgroundColor: 'rgba(100, 150, 255, 0.3)',
        animationName: 'pulse',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '愤怒': { 
        backgroundColor: 'rgba(255, 100, 50, 0.4)',
        animationName: 'pulse',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '浪漫': { 
        backgroundColor: 'rgba(255, 150, 200, 0.4)',
        animationName: 'pulse',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
      '神秘': { 
        backgroundColor: 'rgba(150, 100, 255, 0.4)',
        animationName: 'twinkle',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
      },
    };
    
    return starStyles[emotion] || {};
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br ${getBackgroundClass(currentEmotionalTone || hoveredEmotion) || 'from-slate-900 via-purple-950 to-slate-900'} relative overflow-hidden transition-all duration-1000`}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        {/* 梦幻元素 - 仅在选定情绪时显示 */}
        {currentEmotionalTone && (
          <>
            {/* 飞行的猪 🐷 */}
            <div className="absolute top-20 left-10 text-4xl animate-float">
              🐷
            </div>
            
            {/* 冲浪的人 🏄‍♂️ */}
            <div className="absolute bottom-32 right-20 text-5xl animate-surf">
              🏄‍♂️
            </div>
            
            {/* 漂浮的云朵 ☁️ */}
            <div className="absolute top-10 right-32 text-6xl opacity-70 animate-drift">
              ☁️
            </div>
            
            <div className="absolute top-40 left-1/3 text-5xl opacity-60 animate-drift-delayed">
              ☁️
            </div>
            
            {/* 彩虹桥 🌈 */}
            <div className="absolute bottom-20 left-1/4 text-4xl animate-rainbow">
              🌈
            </div>
            
            {/* 闪烁的星星 ⭐ */}
            <div className="absolute top-1/3 right-10 text-2xl animate-twinkle">
              ⭐
            </div>
            
            <div className="absolute top-2/3 left-20 text-xl animate-twinkle-delayed">
              ⭐
            </div>
          </>
        )}
      </div>

      {/* 星星装饰 - 使用固定位置避免 hydration 错误 */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: 5, left: 10 }, { top: 12, left: 85 }, { top: 8, left: 45 },
          { top: 18, left: 22 }, { top: 25, left: 78 }, { top: 32, left: 55 },
          { top: 15, left: 92 }, { top: 38, left: 8 }, { top: 42, left: 67 },
          { top: 48, left: 33 }, { top: 55, left: 88 }, { top: 62, left: 15 },
          { top: 68, left: 72 }, { top: 75, left: 40 }, { top: 82, left: 95 },
          { top: 88, left: 28 }, { top: 92, left: 60 }, { top: 3, left: 52 },
          { top: 28, left: 3 }, { top: 45, left: 98 }, { top: 72, left: 5 },
          { top: 85, left: 75 }, { top: 95, left: 42 }, { top: 22, left: 65 },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              animationDelay: `${i * 0.12}s`,
              animationDuration: `${2 + (i % 3)}s`,
              ...getStarStyle(hoveredEmotion)
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* 标题 */}
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent mb-4 tracking-wider rounded-full">
            🌙 Dreamer Analyst
          </h1>
          <p className="text-white/60 text-xl font-light tracking-wide rounded-lg">
            AI 梦境分析师 · 解读你的潜意识密码
          </p>
        </header>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* 梦境情感定调选择器 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
            <span>❤️</span> 为你的梦境情感定调
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: '平静', value: '平静', emoji: '🧘' },
              { label: '快乐', value: '快乐', emoji: '😊' },
              { label: '焦虑', value: '焦虑', emoji: '😰' },
              { label: '恐惧', value: '恐惧', emoji: '😨' },
              { label: '兴奋', value: '兴奋', emoji: '🤩' },
              { label: '困惑', value: '困惑', emoji: '🤔' },
              { label: '悲伤', value: '悲伤', emoji: '😢' },
              { label: '愤怒', value: '愤怒', emoji: '😠' },
              { label: '浪漫', value: '浪漫', emoji: '🥰' },
              { label: '神秘', value: '神秘', emoji: '🔮' },
            ].map((option) => (
              <button
                key={option.value}
                onMouseEnter={() => setHoveredEmotion(option.value)}
                onMouseLeave={() => setHoveredEmotion(null)}
                onClick={() => setCurrentEmotionalTone(option.value)}
                className={`p-3 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                  currentEmotionalTone === option.value
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <div className="text-xl">{option.emoji}</div>
                <div className="text-xs mt-1">{option.label}</div>
              </button>
            ))}
          </div>
          {currentEmotionalTone && (
            <div className="mt-3 text-center text-purple-300">
              已选择: <span className="font-semibold">{currentEmotionalTone}</span>
            </div>
          )}
        </div>

        {/* 多段梦境输入区域 */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <span>💭</span> 描述你的梦境片段
            </h3>
            <button
              onClick={addDreamSegment}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white text-sm hover:opacity-90 transition-opacity"
            >
              + 添加片段
            </button>
          </div>

          {dreamSegments.map((segment, index) => (
            <div key={segment.id} className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-white/80">
                  梦境片段 {index + 1}
                </h4>
                {dreamSegments.length > 1 && (
                  <button
                    onClick={() => removeDreamSegment(segment.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    删除
                  </button>
                )}
              </div>
              <textarea
                value={segment.content}
                onChange={(e) => updateDreamSegment(segment.id, e.target.value)}
                placeholder={`第 ${index + 1} 个梦境片段...`}
                className="w-full h-32 bg-white/5 rounded-2xl p-4 text-white text-base
                   placeholder:text-white/30 border border-white/10 
                   focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20
                   resize-none transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* AI问答界面 */}
        {showAiQuestions && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
            <h3 className="text-lg font-semibold text-white/90 mb-4">🤖 AI梦境分析师</h3>
            
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-purple-500/20 text-white ml-8'
                      : 'bg-white/10 text-white/80 mr-8'
                  }`}
                >
                  <div className="text-xs opacity-60 mb-1">
                    {message.role === 'user' ? '你' : 'AI分析师'}
                  </div>
                  <div>{message.content}</div>
                </div>
              ))}
            </div>

            {currentAiQuestion && !showStartAnalysisButton && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="回答AI的问题..."
                  className="flex-1 bg-white/5 rounded-xl p-3 text-white placeholder:text-white/30 border border-white/10 focus:border-purple-400/50 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && userAnswer.trim()) {
                      handleAnswerQuestion(userAnswer);
                      setUserAnswer('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (userAnswer.trim()) {
                      handleAnswerQuestion(userAnswer);
                      setUserAnswer('');
                    }
                  }}
                  disabled={loading.aiQuestion || !userAnswer.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading.aiQuestion ? '...' : '发送'}
                </button>
              </div>
            )}

            {showStartAnalysisButton && (
              <div className="text-center">
                <button
                  onClick={handleStartAnalysisAfterQuestions}
                  disabled={loading.analyze}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity font-semibold"
                >
                  {loading.analyze ? '分析中...' : '开始梦境分析'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 选择分析方式 */}
        {!showAiQuestions && !analysis && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleShowConfirmModal}
              disabled={loading.analyze || getAllDreamContent().trim() === ''}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 
               rounded-xl text-white font-semibold text-lg
               hover:opacity-90 hover:scale-105
               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
               transition-all duration-300 shadow-lg shadow-purple-500/30"
            >
              {loading.analyze ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  分析中...
                </span>
              ) : (
                '✨ 直接开始梦境分析'
              )}
            </button>
            
            <button
              onClick={handleStartAiQuestions}
              disabled={loading.aiQuestion || getAllDreamContent().trim() === ''}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
               rounded-xl text-white font-semibold text-lg
               hover:opacity-90 hover:scale-105
               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
               transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              {loading.aiQuestion ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  准备中...
                </span>
              ) : (
                '🤖 让AI询问更多细节'
              )}
            </button>
          </div>
        )}

        {/* 新分析按钮 */}
        {showNewAnalysisButton && (
          <div className="text-center mb-8">
            <button
              onClick={handleStartNewAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-opacity font-semibold"
            >
              🌟 开始新的梦境分析
            </button>
          </div>
        )}

        {/* 确认模态框 */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>❓</span> 确认梦境描述
              </h3>
              
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 max-h-40 overflow-y-auto">
                <p className="text-white/80 text-sm whitespace-pre-line">
                  {getAllDreamContent()}
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-white/80 mb-2">情感定调: <span className="font-semibold text-purple-300">{currentEmotionalTone || '未选择'}</span></p>
                <p className="text-white/60 text-sm">请确认以上梦境描述是否完整？</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  修改
                </button>
                <button
                  onClick={handleConfirmAndAnalyze}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  确认并分析
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 分析结果 */}
        {analysis && <AnalysisResult analysis={analysis} />}

        {/* 媒体生成 */}
        {analysis && (
          <DreamMedia
            imageUrl={imageUrl}
            videoUrl={videoUrl}
            imagePrompt={analysis.image_prompt}
            onGenerateImage={handleGenerateImage}
            onGenerateVideo={handleGenerateVideo}
            loading={{ image: loading.image, video: loading.video }}
          />
        )}

        {/* 页脚 */}
        <footer className="mt-16 text-center text-white/30 text-sm">
          <p>Powered by GPT-4o · DALL-E 3 · Stable Video Diffusion</p>
          <p className="mt-2">© 2026 Dreamer Analyst</p>
        </footer>
      </div>
    </main>
  );
}