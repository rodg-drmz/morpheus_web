import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { topic, context, goals, audience } = body;

    // Just a placeholder response for now
    return NextResponse.json({
      success: true,
      message: `Morpheus received your topic: "${topic}".`,
      data: {
        context,
        goals,
        audience
      }
    });
  } catch (error) {
    console.error("Error handling Morpheus request:", error);
    return NextResponse.json({ success: false, error: "Something went wrong." }, { status: 500 });
  }
}
