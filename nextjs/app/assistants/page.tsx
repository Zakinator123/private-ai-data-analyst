'use client';

import React, { useState } from 'react';
import { OpenAIAssistantsServiceImpl } from './assistants-service';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';

export default function Assistants() {
  const [assistantId, setAssistantId] = useState('asst_hjxcyeUYlS35M63B2MrtrEDx');
  const [threadId, setThreadId] = useState('thread_FZ7Zv4I80a7PxdR4mM7yy71l');
  const [message, setMessage] = useState('');
  // TODO: Bring in my own type here to replace ThreadMessage
  const [messages, setMessages] = useState<ThreadMessage[]>([]);

  // TODO: Inject using DI
  const assistantsService = new OpenAIAssistantsServiceImpl(process.env.NEXT_PUBLIC_OPENAI_API_KEY!);

  return (
    <div className="flex flex-row w-full max-w-lg py-24 mx-auto stretch space-x-4">
      <div className="flex flex-col w-1/2">
        {assistantId && <p>Assistant ID: {assistantId}</p>}
        {threadId && <p>Thread ID: {threadId}</p>}

        <button
          className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-2 hover:bg-green-600"
          onClick={async () => setAssistantId(await assistantsService.createAssistant())}>
          Create Assistant
        </button>
        <button
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded mb-2 hover:bg-blue-600"
          onClick={async () => setThreadId(await assistantsService.createThread())}>
          Create Thread
        </button>
        <button
          className="bg-purple-500 text-white font-bold py-2 px-4 rounded mb-2 hover:bg-purple-600"
          onClick={async () => assistantsService.initiateRun(threadId, assistantId)}>
          Initiate Run
        </button>
        <textarea
          className="px-3 py-2 border rounded border-gray-300 mb-2 text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          rows={3}
        />
        <button
          className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
          onClick={() => {
            assistantsService.createMessage(threadId, message)
            setMessage('');
          }}>
          Send Message
        </button>
        <button
          className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600"
          onClick={async () => setMessages(await assistantsService.fetchMessages(threadId))}>
          Refresh Messages
        </button>
        <div className="mt-4">
          <h3 className="text-lg font-bold">Messages:</h3>
          <ul>
            {messages.map((msg, index) => {
              if (msg.content[0].type === 'text') {
                return (<li key={index} className="mb-2">
                  <p><strong>Role:</strong> {msg.role}</p>
                  <p><strong>Content:</strong> {msg.content[0].text.value}</p>
                </li>)
              }
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
