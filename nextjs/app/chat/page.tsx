'use client';
import { useState } from 'react';
import { CreateChatCompletionRequest } from 'openai-edge';
import { decodeAIStreamChunk } from '@/ai-sdk/packages/core/shared/utils';

export default function ChatWithFunctionCall() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const functions = [
    {
      'name': 'get_current_weather',
      'description': 'Get the current weather',
      'parameters': {
        'type': 'object',
        'properties': {
          'location': {
            'type': 'string',
            'description': 'The city and state, e.g. San Francisco, CA'
          },
          'format': {
            'type': 'string',
            'enum': ['celsius', 'fahrenheit'],
            'description': 'The temperature unit to use. Infer this from the users location.'
          }
        },
        'required': ['location', 'format']
      }
    }];

  // Make request to openAI API
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const createChatCompletionRequest: CreateChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: input }],
      functions: functions
    };

    const res = await fetch('/api/chat/', {
      method: 'POST',
      body: JSON.stringify(createChatCompletionRequest)
    });

    if (!res.body) {
      throw new Error('No response body');
    }
    let result = '';
    const reader = res.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // Update the chat state with the new message tokens.
      result += decodeAIStreamChunk(value);
    }

    setResponse(result);
  };


  return (
    <div className='mx-auto w-full max-w-md py-24 flex flex-col stretch'>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          className='w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2'
          value={input}
          placeholder='Say something...'
          onChange={(e) => setInput(e.target.value)}
          style={{ color: 'black' }}
        />
      </form>

      {<div>
        {response}
      </div>}
    </div>
  );
}