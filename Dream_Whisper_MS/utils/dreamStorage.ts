export interface PersonalityTraits {
    creativity: number; // 想象力
    logic: number;      // 逻辑性
    emotion: number;    // 情感强度
    spirituality: number; // 灵性觉知
    realism: number;    // 现实连接
    // MBTI 四维度 (0-100 双极量表，可选，兼容旧记录)
    extroversion?: number;  // 外向(100) vs 内向(0)
    intuition?: number;     // 直觉(100) vs 感觉(0)
    thinking?: number;      // 思考(100) vs 情感(0)
    judging?: number;       // 判断(100) vs 知觉(0)
}

export interface DreamRecord {
    id: string;
    date: string; // ISO string
    dream: string;
    analysis: {
        symbols: { symbol: string; meaning: string }[];
        emotional_tone: string;
        psychological_insight: string;
        life_connection: string;
        suggestions: string[];
        personality_traits: PersonalityTraits;
        image_prompt: string;
    };
    imageUrl?: string;
    videoUrl?: string;
}

const STORAGE_KEY = 'dreamer_analyst_records';

export const DreamStorage = {
    getDreams: (): DreamRecord[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load dreams', e);
            return [];
        }
    },

    saveDream: (dreamRecord: DreamRecord) => {
        try {
            const dreams = DreamStorage.getDreams();
            const newDreams = [dreamRecord, ...dreams];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newDreams));
            return newDreams;
        } catch (e) {
            console.error('Failed to save dream', e);
            return [];
        }
    },

    updateDream: (id: string, updates: Partial<DreamRecord>) => {
        try {
            const dreams = DreamStorage.getDreams();
            const newDreams = dreams.map(d => d.id === id ? { ...d, ...updates } : d);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newDreams));
            return newDreams;
        } catch (e) {
            console.error('Failed to update dream', e);
            return [];
        }
    },

    calculatePersona: (dreams: DreamRecord[]): PersonalityTraits => {
        if (dreams.length === 0) {
            return { creativity: 0, logic: 0, emotion: 0, spirituality: 0, realism: 0 };
        }

        // 基础五维度：所有记录参与计算
        const total = dreams.reduce((acc, curr) => {
            const traits = curr.analysis.personality_traits || { creativity: 50, logic: 50, emotion: 50, spirituality: 50, realism: 50 };
            return {
                creativity: acc.creativity + traits.creativity,
                logic: acc.logic + traits.logic,
                emotion: acc.emotion + traits.emotion,
                spirituality: acc.spirituality + traits.spirituality,
                realism: acc.realism + traits.realism,
            };
        }, { creativity: 0, logic: 0, emotion: 0, spirituality: 0, realism: 0 });

        const base: PersonalityTraits = {
            creativity: Math.round(total.creativity / dreams.length),
            logic: Math.round(total.logic / dreams.length),
            emotion: Math.round(total.emotion / dreams.length),
            spirituality: Math.round(total.spirituality / dreams.length),
            realism: Math.round(total.realism / dreams.length),
        };

        // MBTI 四维度：仅包含 MBTI 数据的记录参与计算
        const mbtiDreams = dreams.filter(d => {
            const t = d.analysis.personality_traits;
            return t && t.extroversion !== undefined && t.intuition !== undefined
                && t.thinking !== undefined && t.judging !== undefined;
        });

        if (mbtiDreams.length > 0) {
            const mbtiTotal = mbtiDreams.reduce((acc, curr) => {
                const t = curr.analysis.personality_traits!;
                return {
                    extroversion: acc.extroversion + (t.extroversion ?? 50),
                    intuition: acc.intuition + (t.intuition ?? 50),
                    thinking: acc.thinking + (t.thinking ?? 50),
                    judging: acc.judging + (t.judging ?? 50),
                };
            }, { extroversion: 0, intuition: 0, thinking: 0, judging: 0 });

            base.extroversion = Math.round(mbtiTotal.extroversion / mbtiDreams.length);
            base.intuition = Math.round(mbtiTotal.intuition / mbtiDreams.length);
            base.thinking = Math.round(mbtiTotal.thinking / mbtiDreams.length);
            base.judging = Math.round(mbtiTotal.judging / mbtiDreams.length);
        }

        return base;
    }
};
