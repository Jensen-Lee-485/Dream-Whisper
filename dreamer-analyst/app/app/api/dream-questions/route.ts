import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// 使用智谱 GLM API（兼容 OpenAI 格式）
const openai = new OpenAI({
    apiKey: process.env.GLM_API_KEY,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
});

const QUESTION_SYSTEM_PROMPT = `你是一位专业的梦境分析师，融合荣格分析心理学和弗洛伊德精神分析理论。

你的任务是通过一系列有针对性的问题来深入了解用户的梦境，以便进行更精确的分析。

具体步骤：
1. 首先分析用户提供的梦境描述
2. 识别出模糊或需要进一步澄清的部分
3. 提出1-2个有针对性的问题来获取更多细节
4. 每次只问1-2个问题，不要一次问太多
5. 问题应该帮助理解：
   - 梦中人物的身份和关系
   - 梦境场景的具体细节
   - 梦中物体的特征
   - 梦中的情绪感受
   - 梦境发生的背景和情境

当经过几轮对话后，你认为已经获得了足够详细的信息来做出高质量的分析时，请返回ask_for_analysis字段，
询问用户是否同意使用目前收集到的信息进行分析。

返回 JSON 格式：
{
  "question": "你想问的梦境相关问题",
  "next_question": "如果你还需要进一步提问则使用此字段",
  "ask_for_analysis": "当收集到足够信息时，询问用户是否开始分析"
}

注意：每次响应时，只返回一个字段，要么是question，要么是next_question，要么是ask_for_analysis。
`;

export async function POST(req: Request) {
    try {
        const { dream, emotional_tone, user_answer, conversation_history } = await req.json();

        if (!dream || dream.trim().length === 0) {
            return NextResponse.json({ error: '请输入梦境描述' }, { status: 400 });
        }

        // 构建对话历史
        let messages: Array<{role: string, content: string}> = [
            { role: 'system', content: QUESTION_SYSTEM_PROMPT }
        ];

        // 添加初始梦境和情感定调信息
        let initialPrompt = `这是用户的梦境描述：\n\n${dream}\n\n`;
        if (emotional_tone) {
            initialPrompt += `用户为此梦境设定的情感定调为：${emotional_tone}\n\n`;
        }
        initialPrompt += "请提出一个或两个有针对性的问题来更好地理解这个梦境。";
        
        messages.push({ role: 'user', content: initialPrompt });

        // 如果有用户回答，添加到对话历史
        if (user_answer) {
            messages.push({ role: 'user', content: user_answer });
        }

        // 如果有对话历史，也加入到消息中
        if (conversation_history && Array.isArray(conversation_history)) {
            conversation_history.forEach((msg: any) => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });
        }

        const response = await openai.chat.completions.create({
            model: 'glm-4-flash',
            messages: messages,
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        const content = response.choices[0].message.content;
        if (!content) {
            return NextResponse.json({ error: '获取问题失败，请重试' }, { status: 500 });
        }

        // 尝试解析AI返回的内容
        let result;
        try {
            result = JSON.parse(content);
        } catch (parseError) {
            console.error('JSON解析错误:', parseError);
            console.error('AI返回的原始内容:', content);
            
            // 如果JSON解析失败，尝试提取问题文本
            // 查找问题的常见模式
            const questionMatch = content.match(/"?(question|next_question|ask_for_analysis)"?\s*:\s*"([^"]+)"/);
            if (questionMatch) {
                const field = questionMatch[1];
                const value = questionMatch[2];
                
                result = {};
                result[field] = value;
            } else {
                // 如果无法解析，返回一个通用问题
                // 尝试从内容中提取主要文本部分
                const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
                try {
                    result = JSON.parse(cleanContent);
                } catch {
                    // 如果还是失败，直接使用原始内容作为问题
                    result = { 
                        question: content.replace(/["{}]/g, '').replace(/\\n/g, ' ').trim() || 
                                "为了更好地分析您的梦境，请提供更多关于梦境中人物、场景或情绪的细节。" 
                    };
                }
            }
        }

        // 确保返回的对象包含至少一个有效的字段
        if (!result.question && !result.next_question && !result.ask_for_analysis) {
            // 如果没有任何有效字段，但有其他内容，尝试使用主要内容
            const validKeys = Object.keys(result).filter(key => 
                typeof result[key] === 'string' && 
                result[key].length > 0 &&
                !['id', 'model', 'created', 'object'].includes(key)
            );
            
            if (validKeys.length > 0) {
                // 使用最长的字符串作为问题
                const longestKey = validKeys.reduce((a, b) => 
                    result[a].length > result[b].length ? a : b
                );
                result = { question: result[longestKey] };
            } else {
                // 如果没有任何有效字段，返回默认问题
                result = { 
                    question: "为了更好地分析您的梦境，请提供更多关于梦境中人物、场景或情绪的细节。" 
                };
            }
        }
        
        // 添加一些调试信息
        console.log('AI返回的结果:', result);
        console.log('消息历史长度:', conversation_history?.length || 0);
        
        // 如果经过几轮对话后认为信息足够，询问是否开始分析
        if (conversation_history && conversation_history.length > 6) { // 假设经过3轮问答后信息足够
            console.log('达到问答轮次上限，准备开始分析');
            return NextResponse.json({
                ask_for_analysis: "我已经收集了足够的梦境细节，您希望我现在开始分析这个梦境吗？"
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Dream questions error:', error);
        console.error('Full error details:', error);
        return NextResponse.json(
            { error: '获取问题过程中出现错误，请稍后重试' },
            { status: 500 }
        );
    }
}