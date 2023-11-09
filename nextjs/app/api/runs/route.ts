import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Handle POST request
    const { thread_id, assistant_id } = await req.body as PostData;

    const run = await openai.beta.threads.runs.create(
      thread_id,
      {
        assistant_id: assistant_id,
        instructions: "Please address the user as Jane Doe. The user has a premium account."
      }
    );

    return res.json(run);
  } else if (req.method === 'GET') {
    // Handle GET request
    const { threadId, runId } = req.query as unknown as QueryData;

    if (!threadId || !runId) {
      return res.status(400).json({ error: "Missing threadId or runId query parameters" });
    }

    try {
      const retrievedRun = await openai.beta.threads.runs.retrieve(threadId, runId);
      return res.json(retrievedRun);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: "An unknown error occurred" });
    }
  } else {
    // Handle other HTTP methods
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
