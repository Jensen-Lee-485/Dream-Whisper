import { PersonalityTraits } from './dreamStorage';

// 16 种 MBTI 类型及中文名称
export const MBTI_TYPES: Record<string, string> = {
    'INTJ': '建筑师',
    'INTP': '逻辑学家',
    'ENTJ': '指挥官',
    'ENTP': '辩论家',
    'INFJ': '提倡者',
    'INFP': '调停者',
    'ENFJ': '主人公',
    'ENFP': '竞选者',
    'ISTJ': '物流师',
    'ISFJ': '守卫者',
    'ESTJ': '总经理',
    'ESFJ': '执政官',
    'ISTP': '鉴赏家',
    'ISFP': '探险家',
    'ESTP': '企业家',
    'ESFP': '表演者',
};

// 四维度标签
export const MBTI_DIMENSIONS = [
    { key: 'extroversion' as const, low: '内向 (I)', high: '外向 (E)', label: 'E/I' },
    { key: 'intuition' as const, low: '感觉 (S)', high: '直觉 (N)', label: 'N/S' },
    { key: 'thinking' as const, low: '情感 (F)', high: '思考 (T)', label: 'T/F' },
    { key: 'judging' as const, low: '知觉 (P)', high: '判断 (J)', label: 'J/P' },
];

/**
 * 从 PersonalityTraits 的 MBTI 维度计算 4 字母 MBTI 类型码
 * 每个维度 >= 50 取高位字母，< 50 取低位字母
 */
export function getMBTIType(traits: PersonalityTraits): string | null {
    if (
        traits.extroversion === undefined ||
        traits.intuition === undefined ||
        traits.thinking === undefined ||
        traits.judging === undefined
    ) {
        return null;
    }

    const e = traits.extroversion >= 50 ? 'E' : 'I';
    const n = traits.intuition >= 50 ? 'N' : 'S';
    const t = traits.thinking >= 50 ? 'T' : 'F';
    const j = traits.judging >= 50 ? 'J' : 'P';

    return `${e}${n}${t}${j}`;
}

/**
 * 获取 MBTI 类型的中文名称
 */
export function getMBTILabel(type: string): string {
    return MBTI_TYPES[type] || '未知类型';
}

/**
 * 检查 traits 是否包含完整的 MBTI 数据
 */
export function hasMBTIData(traits: PersonalityTraits): boolean {
    return (
        traits.extroversion !== undefined &&
        traits.intuition !== undefined &&
        traits.thinking !== undefined &&
        traits.judging !== undefined
    );
}
