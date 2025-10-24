/**
 * AI Parser Service
 * Natural language expense parsing using OpenAI GPT with fallback mechanism
 */

import OpenAI from 'openai'
import type { ExpenseCategory, ParseExpenseResponse, AILearningSample } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

interface ParseContext {
  userId: string
  learningSamples?: AILearningSample[]
  userTimezone?: string
}

export class AIParserService {
  /**
   * Parse natural language input to expense data
   * US-001: AI 自然語言解析
   */
  async parse(input: string, context: ParseContext): Promise<ParseExpenseResponse> {
    try {
      // Build context from learning samples
      const learningContext = this.buildLearningContext(context.learningSamples || [])

      // Call OpenAI GPT
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(learningContext),
          },
          {
            role: 'user',
            content: input,
          },
        ],
      })

      // Extract and parse response
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const parsed = this.parseGPTResponse(content)

      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(parsed, input)

      return {
        ...parsed,
        confidence,
        fallbackUsed: false,
      }
    } catch (error) {
      console.error('AI parsing failed, using fallback:', error)
      // US-002: AI 降級機制
      return this.fallbackParse(input)
    }
  }

  /**
   * Build system prompt with user learning context
   */
  private buildSystemPrompt(learningContext: string): string {
    return `你是一個智能記帳助手,專門解析用戶的自然語言輸入並提取消費資訊。

## 任務
從用戶的輸入中提取以下資訊:
1. 金額 (amount): 數字,必填
2. 分類 (category): 必須是以下之一
   - FOOD (飲食)
   - TRANSPORT (交通)
   - ENTERTAINMENT (娛樂)
   - SHOPPING (購物)
   - HOUSING (居住)
   - MEDICAL (醫療)
   - EDUCATION (教育)
   - SUBSCRIPTION (訂閱)
   - OTHER (其他)
   - INCOME (收入)
3. 描述 (description): 文字描述,選填

## 用戶歷史學習記錄
${learningContext}

## 輸出格式
嚴格使用以下 JSON 格式回應,不要包含任何其他文字:
{
  "amount": 數字,
  "category": "分類代碼",
  "description": "描述文字"
}

## 範例
輸入: "午餐 150"
輸出: {"amount": 150, "category": "FOOD", "description": "午餐"}

輸入: "坐捷運 30 元"
輸出: {"amount": 30, "category": "TRANSPORT", "description": "捷運"}

輸入: "Netflix 訂閱 390"
輸出: {"amount": 390, "category": "SUBSCRIPTION", "description": "Netflix"}

現在請解析用戶的輸入。`
  }

  /**
   * Build learning context from user corrections
   */
  private buildLearningContext(samples: AILearningSample[]): string {
    if (samples.length === 0) {
      return '暫無歷史記錄'
    }

    const recent = samples.slice(0, 10) // Use last 10 samples
    return recent
      .map(
        (s) =>
          `輸入: "${s.originalInput}" → 正確分類: ${s.correctedCategory}, 金額: ${s.correctedAmount}, 描述: ${s.correctedDescription}`
      )
      .join('\n')
  }

  /**
   * Parse GPT's JSON response
   */
  private parseGPTResponse(text: string): Omit<ParseExpenseResponse, 'confidence' | 'fallbackUsed'> {
    try {
      const parsed = JSON.parse(text)

      return {
        amount: Number(parsed.amount),
        category: parsed.category as ExpenseCategory,
        description: parsed.description || '',
      }
    } catch (error) {
      throw new Error('Failed to parse GPT response: ' + text)
    }
  }

  /**
   * Calculate confidence score based on parsing quality
   */
  private calculateConfidence(parsed: any, originalInput: string): number {
    let confidence = 50 // Base confidence

    // Has valid amount
    if (parsed.amount > 0) confidence += 20

    // Has category
    if (parsed.category) confidence += 15

    // Has description
    if (parsed.description && parsed.description.length > 0) confidence += 10

    // Description matches input (simple check)
    if (parsed.description && originalInput.includes(parsed.description)) {
      confidence += 5
    }

    return Math.min(confidence, 100)
  }

  /**
   * Fallback parser using rule-based approach
   * US-002: AI 降級機制
   */
  private fallbackParse(input: string): ParseExpenseResponse {
    const rules = [
      // Pattern: "午餐 150"
      {
        pattern: /(\d+(?:\.\d+)?)/,
        extract: (match: RegExpMatchArray, text: string) => ({
          amount: parseFloat(match[1]),
          description: text.replace(match[1], '').trim(),
        }),
      },
      // Pattern: "花了 150 元買午餐"
      {
        pattern: /(?:花了|支付|付了)?[\s]*(\d+(?:\.\d+)?)[\s]*(?:元|塊|dollar)?(?:買|on|for)?[\s]*(.+)/i,
        extract: (match: RegExpMatchArray) => ({
          amount: parseFloat(match[1]),
          description: match[2]?.trim() || '',
        }),
      },
    ]

    for (const rule of rules) {
      const match = input.match(rule.pattern)
      if (match) {
        const extracted = rule.extract(match, input)
        const category = this.guessCategory(extracted.description)

        return {
          amount: extracted.amount,
          category,
          description: extracted.description,
          confidence: 50, // Lower confidence for fallback
          fallbackUsed: true,
        }
      }
    }

    // If no pattern matches, return default
    return {
      amount: 0,
      category: 'OTHER',
      description: input,
      confidence: 30,
      fallbackUsed: true,
    }
  }

  /**
   * Simple keyword-based category guessing
   */
  private guessCategory(description: string): ExpenseCategory {
    const keywords: Record<ExpenseCategory, string[]> = {
      FOOD: ['午餐', '晚餐', '早餐', '餐', '吃', '喝', '咖啡', '飲料', '食'],
      TRANSPORT: ['捷運', '公車', '計程車', 'uber', 'taxi', '交通', '油錢', '停車'],
      ENTERTAINMENT: ['電影', '遊戲', '娛樂', 'ktv', '唱歌', '演唱會'],
      SHOPPING: ['買', '購物', '衣服', '鞋子', '包包', '購'],
      HOUSING: ['房租', '水電', '瓦斯', '網路', '租金', '管理費'],
      MEDICAL: ['醫療', '看病', '藥', '診所', '醫院', '健保'],
      EDUCATION: ['課程', '書', '學費', '補習', '教育'],
      SUBSCRIPTION: ['訂閱', 'netflix', 'spotify', 'youtube', '會員'],
      INCOME: ['收入', '薪水', '獎金', '紅包', '進帳'],
      OTHER: [],
    }

    const lowerDesc = description.toLowerCase()

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some((word) => lowerDesc.includes(word))) {
        return category as ExpenseCategory
      }
    }

    return 'OTHER'
  }
}

// Singleton instance
export const aiParser = new AIParserService()
