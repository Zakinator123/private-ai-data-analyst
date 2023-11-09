'use client';

import React, { useState } from 'react';

export default function Assistants() {
  const [assistantId, setAssistantId] = useState('');
  const [threadId, setThreadId] = useState('');
  const [message, setMessage] = useState('');

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
  };

  return (
    <div className="flex flex-row w-full max-w-lg py-24 mx-auto stretch space-x-4">
      <div className="flex flex-col w-1/2">
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
        <input 
          className="px-3 py-2 border rounded border-gray-300 mb-2"
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type a message" 
        />
        <button 
          className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
          onClick={createMessage}>
          Send Message
        </button>
      </div>
    </div>
  );
}
