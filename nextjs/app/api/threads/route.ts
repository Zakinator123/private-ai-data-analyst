import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const thread = await openai.beta.threads.create();
    return NextResponse.json({ thread_id: thread.id });
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    } else {
      return new NextResponse(JSON.stringify({ error: 'An unknown error occurred' }), { status: 500 });
    }
  }
}

export async function GET(req: NextRequest) {
  const { threadId } = req.nextUrl.searchParams;

  if (!threadId) {
    return new NextResponse(JSON.stringify({ error: "Missing 'threadId' query parameter" }), { status: 400 });
  }

  try {
    const retrievedMessages = await openai.beta.threads.messages.list(threadId);
    return NextResponse.json(retrievedMessages);
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    } else {
      return new NextResponse(JSON.stringify({ error: 'An unknown error occurred' }), { status: 500 });
    }
  }
}
