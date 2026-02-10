import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// 使用智谱 GLM API（兼容 OpenAI 格式）
const openai = new OpenAI({
    apiKey: process.env.GLM_API_KEY,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
});

const SYSTEM_PROMPT = `你是一位专业的梦境分析师，融合荣格分析心理学和弗洛伊德精神分析理论。

分析梦境时请：
1. 识别核心符号（人物、场景、物品、情绪、颜色）
2. 解释每个符号的象征含义
3. 分析整体情绪基调
4. 给出与现实生活的可能关联
5. 提供建设性的心理建议

特别注意：用户可能会提供他们为梦境设定的情感定调，请结合这一信息进行更深入的分析。

返回 JSON 格式：
{
  "symbols": [{"symbol": "符号名称", "meaning": "象征含义"}],
  "emotional_tone": "情绪基调（如：焦虑、释然、迷茫、希望等）",
  "psychological_insight": "心理层面的深度洞察",
  "life_connection": "与现实生活可能的关联",
  "suggestions": ["建设性建议1", "建设性建议2"],
  "image_prompt": "用于绘画的详细英文场景描述，必须包含：1)具体的场景环境描述 2)梦中出现的人物或生物的外貌特征 3)关键物品的形态细节 4)光线和色彩氛围（如golden sunset light, misty blue fog等）5)情绪感觉的视觉化呈现。风格：surrealistic dreamscape, ethereal atmosphere, cinematic lighting, highly detailed digital painting, artstation trending"
}`;

export async function POST(req: Request) {
    try {
        const { dream, emotional_tone } = await req.json();

        if (!dream || dream.trim().length === 0) {
            return NextResponse.json({ error: '请输入梦境描述' }, { status: 400 });
        }

        // 如果提供了情感定调，则将其加入到提示中
        let userContent = `请分析这个梦境：\n\n${dream}`;
        if (emotional_tone) {
            userContent += `\n\n用户为此梦境设定的情感定调为：${emotional_tone}。请结合此情感定调进行分析。`;
        }

        const response = await openai.chat.completions.create({
            model: 'glm-4-flash',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userContent }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        const content = response.choices[0].message.content;
        if (!content) {
            return NextResponse.json({ error: '分析失败，请重试' }, { status: 500 });
        }

        let analysis;
        try {
            analysis = JSON.parse(content);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            console.error('Raw content:', content);
            return NextResponse.json({ error: '分析结果格式错误，请重试' }, { status: 500 });
        }
        
        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Dream analysis error:', error);
        return NextResponse.json(
            { error: '分析过程中出现错误，请稍后重试' },
            { status: 500 }
        );
    }
}
