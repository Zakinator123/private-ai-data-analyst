import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export const runtime = 'edge';

interface PostData {
  thread_id: string;
  assistant_id: string;
}

interface QueryData {
  threadId: string;
  runId: string;
}

export async function POST(req: NextRequest) {
  try {
    const { thread_id, assistant_id } = await req.json() as PostData;

    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: assistant_id,
      instructions: "Please address the user as Jane Doe. The user has a premium account."
    });

    return NextResponse.json(run);
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new NextResponse(JSON.stringify({ error: 'An unknown error occurred' }), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { threadId, runId } = req.nextUrl.searchParams;

  if (!threadId || !runId) {
    return new NextResponse(JSON.stringify({ error: "Missing threadId or runId query parameters" }), { status: 400 });
  }

  try {
    const retrievedRun = await openai.beta.threads.runs.retrieve(threadId, runId);
    return NextResponse.json(retrievedRun);
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new NextResponse(JSON.stringify({ error: 'An unknown error occurred' }), { status: 500 });
  }
}
