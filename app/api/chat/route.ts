import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful assistant for the Defend the Constitution Platform (DCP), a citizen-led movement in Zimbabwe. 
Your role is to:
- Answer questions about DCP's mission, values, and activities
- Provide information about constitutional rights and democratic governance
- Help users understand how to get involved with the movement
- Be respectful, informative, and supportive

Key information about DCP:
- DCP opposes the 2030 agenda
- Promotes constitutional supremacy and democratic governance
- Focuses on civic education, advocacy, and community engagement
- Works to protect constitutional rights and ensure accountability

Keep responses concise, helpful, and aligned with DCP's values. If asked about something outside your knowledge, politely redirect to the contact form.`

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Build conversation messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })
        }
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message.trim() })

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4' for better quality
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json(
      { response },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

