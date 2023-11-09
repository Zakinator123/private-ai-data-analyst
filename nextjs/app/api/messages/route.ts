import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";

const openai = new OpenAI();

export const runtime = 'edge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { thread_id, messageToCreate } = await req.body;

    if (req.method === 'POST') {
        // Handle POST request
        try {
            const message = await openai.beta.threads.messages.create(
                thread_id,
                {
                    role: "user",
                    content: messageToCreate
                }
            );

            return res.json({ message });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: 'An unknown error occurred' });
        }
    } else if (req.method === 'GET') {
        // Handle GET request
        const { threadId } = req.query;

        if (!threadId || typeof threadId !== 'string') {
            return res.status(400).json({ error: "Missing or invalid 'threadId' query parameter" });
        }

        try {
            const retrievedMessages = await openai.beta.threads.messages.list(threadId);
            return res.json(retrievedMessages);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: 'An unknown error occurred' });
        }
    } else {
        // Handle other HTTP methods
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
