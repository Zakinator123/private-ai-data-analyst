'use client';

import React, { useState } from 'react';



interface MessageContent {
  type: string;
  text: {
    value: string;
    annotations: any[]; // Define more specific type if you have the structure
  };
}

interface Message {
  id: string;
  role: string;
  content: MessageContent[];
}

interface FetchMessagesResponse {
  body: {
    data: Message[];
  };
}

interface DisplayMessage {
  id: string;
  role: string;
  content: string;
  type: string;
}


export default function Assistants() {
  const [assistantId, setAssistantId] = useState('asst_hjxcyeUYlS35M63B2MrtrEDx');
  const [threadId, setThreadId] = useState('thread_FZ7Zv4I80a7PxdR4mM7yy71l');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<DisplayMessage[]>([]);

  const fetchMessages = async () => {
    if (!threadId) return;
    const response = await fetch(`/api/messages?threadId=${threadId}`);
    const data: FetchMessagesResponse = await response.json();
    const parsedMessages: DisplayMessage[] = data.body.data.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content.map(c => c.text.value).join(' '),
      type: msg.content.map(c => c.type).join(', ')
    }));
    setMessages(parsedMessages);
  };

  const createAssistant = async () => {
    const response = await fetch('/api/assistants', { method: 'POST' });
    const data = await response.json();
    setAssistantId(data.assistant_id);
  };

  const createThread = async () => {
    const response = await fetch('/api/threads', { method: 'POST' });
    const data = await response.json();
    setThreadId(data.thread_id);
  };

  const initiateRun = async () => {
    if (!assistantId || !threadId) return;
    await fetch('/api/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ thread_id: threadId, assistant_id: assistantId }),
    });
  };

  const createMessage = async () => {
    if (!threadId || !message) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ thread_id: threadId, message: message }),
    });
    setMessage('');
    fetchMessages();
  };

  return (
    <div className="flex flex-row w-full max-w-lg py-24 mx-auto stretch space-x-4">
      <div className="flex flex-col w-1/2">
        {assistantId && <p>Assistant ID: {assistantId}</p>}
        {threadId && <p>Thread ID: {threadId}</p>}

        <button 
          className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-2 hover:bg-green-600"
          onClick={createAssistant}>
          Create Assistant
        </button>
        <button 
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded mb-2 hover:bg-blue-600"
          onClick={createThread}>
          Create Thread
        </button>
        <button 
          className="bg-purple-500 text-white font-bold py-2 px-4 rounded mb-2 hover:bg-purple-600"
          onClick={initiateRun}>
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
          onClick={createMessage}>
          Send Message
        </button>
        <button 
          className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600"
          onClick={fetchMessages}>
          Refresh Messages
        </button>
        <div className="mt-4">
          <h3 className="text-lg font-bold">Messages:</h3>
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className="mb-2">
                <p><strong>Role:</strong> {msg.role}</p>
                <p><strong>Type:</strong> {msg.type}</p>
                <p><strong>Content:</strong> {msg.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
