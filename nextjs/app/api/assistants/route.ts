import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

import OpenAI from "openai";

const openai = new OpenAI();

export const runtime = 'edge';

export async function POST(req: Request) {
  // const { messages, functions, function_call } = await req.json();

  const assistant = await openai.beta.assistants.create({
    name: "Math Tutor",
    instructions: "You are a personal math tutor. Write and run code to answer math questions.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-1106-preview"
  });

  return NextResponse.json({assistant_id: assistant.id});
}