import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let conversationHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
  {
    role: 'system',
    content:
      "You are Morpheus, Lord of Dreams. You speak with poetic wisdom, metaphor, and philosophical insight. Guide the user as if through a dream—asking deep questions, helping them reflect, and inspiring insight about the digital world and beyond.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'No message provided.' }, { status: 400 });
    }

    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversationHistory,
    });

    const reply = response.choices[0].message?.content?.trim();

    // Add assistant response to history
    if (reply) {
      conversationHistory.push({ role: 'assistant', content: reply });
    }

    return NextResponse.json({
      success: true,
      response: reply || "I am here, but I found no words for this dream.",
    });
  } catch (error) {
    console.error('Morpheus error:', error);
    return NextResponse.json(
      { success: false, error: 'Morpheus encountered a dream-portal error.' },
      { status: 500 }
    );
  }
}
