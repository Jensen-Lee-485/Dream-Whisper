'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { PersonalityTraits } from '@/utils/dreamStorage';
import { getMBTIType, getMBTILabel, hasMBTIData, MBTI_DIMENSIONS } from '@/utils/mbtiHelpers';
import { Sparkles, Brain } from 'lucide-react';

interface PersonaRadarProps {
    traits: PersonalityTraits;
}

function MBTIBadge({ traits }: { traits: PersonalityTraits }) {
    const type = getMBTIType(traits);
    if (!type) return null;
    const label = getMBTILabel(type);

    return (
        <div className="text-center mb-6 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <Brain className="w-5 h-5 text-purple-300" />
                <div>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200 tracking-widest">
                        {type}
                    </span>
                    <span className="text-purple-300/80 ml-2 text-sm">
                        {label}
                    </span>
                </div>
            </div>
            <p className="text-indigo-400/50 text-xs mt-2">基于梦境分析推断的性格类型倾向</p>
        </div>
    );
}

function MBTIDimensionBars({ traits }: { traits: PersonalityTraits }) {
    if (!hasMBTIData(traits)) return null;

    return (
        <div className="w-full mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="flex items-center gap-2 mb-2 justify-center">
                <div className="w-8 h-px bg-indigo-500/30" />
                <span className="text-xs text-indigo-400/60 tracking-wider">性格维度分布</span>
                <div className="w-8 h-px bg-indigo-500/30" />
            </div>
            {MBTI_DIMENSIONS.map((dim) => {
                const value = traits[dim.key] ?? 50;
                return (
                    <div key={dim.key} className="px-2">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs text-indigo-300/70 w-20 text-right pr-2">{dim.low}</span>
                            <span className="text-[10px] text-indigo-500/50 font-mono">{dim.label}</span>
                            <span className="text-xs text-indigo-300/70 w-20 pl-2">{dim.high}</span>
                        </div>
                        <div className="relative h-2.5 bg-indigo-950/50 rounded-full overflow-hidden border border-indigo-500/10">
                            {/* 背景刻度线 */}
                            <div className="absolute inset-0 flex justify-center">
                                <div className="w-px h-full bg-indigo-400/20" />
                            </div>
                            {/* 填充条 */}
                            <div
                                className="absolute top-0 h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    left: value >= 50 ? '50%' : `${value}%`,
                                    width: value >= 50 ? `${value - 50}%` : `${50 - value}%`,
                                    background: value >= 50
                                        ? 'linear-gradient(90deg, rgba(139,92,246,0.6), rgba(99,102,241,0.8))'
                                        : 'linear-gradient(270deg, rgba(139,92,246,0.6), rgba(168,85,247,0.8))',
                                }}
                            />
                            {/* 指示点 */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-lg shadow-purple-500/40 transition-all duration-700 ease-out"
                                style={{ left: `calc(${value}% - 5px)` }}
                            />
                        </div>
                        <div className="text-center mt-0.5">
                            <span className="text-[10px] text-indigo-400/40 font-mono">{value}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function PersonaRadar({ traits }: PersonaRadarProps) {
    const data = [
        { subject: '想象力', A: traits.creativity, fullMark: 100 },
        { subject: '逻辑性', A: traits.logic, fullMark: 100 },
        { subject: '情感强度', A: traits.emotion, fullMark: 100 },
        { subject: '灵性觉知', A: traits.spirituality, fullMark: 100 },
        { subject: '现实连接', A: traits.realism, fullMark: 100 },
    ];

    // Check if all scores are 0 (indicates no data)
    const isExample = data.every(d => d.A === 0);
    const showMBTI = hasMBTIData(traits) && !isExample;

    return (
        <div className="w-full bg-indigo-950/20 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6 text-indigo-200 z-10">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-medium tracking-wider">潜意识人格画像</h3>
            </div>

            {/* Part 1: MBTI 类型徽章 */}
            {showMBTI && (
                <div className="z-10 w-full">
                    <MBTIBadge traits={traits} />
                </div>
            )}

            {isExample && (
                <div className="absolute inset-0 z-0 flex items-center justify-center bg-indigo-950/50 backdrop-blur-[2px]">
                    <div className="text-center p-4">
                        <p className="text-indigo-200 font-light mb-2">人格画像尚未生成</p>
                        <p className="text-xs text-indigo-400/60">解析您的第一个梦境后点亮</p>
                    </div>
                </div>
            )}

            {/* Part 2: 五维雷达图 */}
            <div className="w-full h-[300px] -ml-2 z-10 opacity-80">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={isExample ? data.map(d => ({ ...d, A: 100 })) : data}>
                        <PolarGrid stroke="#6366f1" strokeOpacity={0.2} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#a5b4fc', fontSize: 13, fontWeight: 300 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="My Persona"
                            dataKey="A"
                            stroke={isExample ? "#6366f1" : "#818cf8"}
                            strokeWidth={isExample ? 1 : 2}
                            strokeDasharray={isExample ? "4 4" : "0"}
                            fill="#6366f1"
                            fillOpacity={isExample ? 0.05 : 0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Part 3: MBTI 四维度双极进度条 */}
            {showMBTI && (
                <div className="z-10 w-full max-w-md">
                    <MBTIDimensionBars traits={traits} />
                </div>
            )}

            <div className="text-center text-xs text-indigo-400/40 mt-4 max-w-sm">
                *基于您积累的梦境分析生成，随着记录增加将越发精准。
            </div>
        </div>
    );
}
