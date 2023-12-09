import { OpenAI } from 'openai';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { Run } from 'openai/resources/beta/threads/runs/runs';

export interface OpenAIAssistantsService {
    createAssistant(): Promise<string>;
    createThread(): Promise<string>;
    initiateRun(threadId: string, assistantId: string): Promise<void>;
    createMessage(threadId: string, message: string): Promise<void>;
    checkRunStatus(threadId: string, runId: string): Promise<Run['status']>;
    fetchMessages(threadId: string): Promise<ThreadMessage[]>;
}

export class OpenAIAssistantsServiceImpl implements OpenAIAssistantsService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }

    async createAssistant(): Promise<string> {
        const assistant = await this.openai.beta.assistants.create({
            name: "Math Tutor",
            instructions: "You are a personal math tutor. Write and run code to answer math questions.",
            tools: [{ type: "code_interpreter" }],
            model: "gpt-4-1106-preview"
        });
        return assistant.id;
    }

    async createThread(): Promise<string> {
        const thread = await this.openai.beta.threads.create();
        return thread.id;
    }

    async initiateRun(threadId: string, assistantId: string): Promise<void> {
        await this.openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });
    }

    async createMessage(threadId: string, message: string): Promise<void> {
        await this.openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message
        });
    }

    async checkRunStatus(threadId: string, runId: string): Promise<Run['status']> {
        const runStatus = await this.openai.beta.threads.runs.retrieve(threadId, runId);
        return runStatus.status;
      }

    async fetchMessages(threadId: string): Promise<ThreadMessage[]> {
        const messages = await this.openai.beta.threads.messages.list(threadId);
        return messages.data
    }
}

