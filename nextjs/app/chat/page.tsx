'use client';
import { nanoid } from 'nanoid';
import { ChatCompletionFunctions } from 'openai-edge/types/api';
import { FunctionCallHandler } from 'ai';
import { useChat } from 'ai/react';


const functions: ChatCompletionFunctions[] = [
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


export default function Chat() {

  const functionCallHandler: FunctionCallHandler = async (chatMessages, functionCall) => {
    // if (functionCall.name === 'get_current_weather') {

    if (functionCall.arguments != null) {
      const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
      console.log(parsedFunctionCallArguments);
    }

    return Promise.resolve({
      messages: [...chatMessages, {
        name: 'get_current_weather',
        id: nanoid(),
        role: 'function',
        content: 'The weather is 72 degrees and sunny.',
      }],
      functions: functions,
    });
    // }
  };

  const { messages, input, handleInputChange, handleSubmit } = useChat({ experimental_onFunctionCall: functionCallHandler });

  return (
    <div className='mx-auto w-full max-w-md py-24 flex flex-col stretch'>

      <form onSubmit={(e) => handleSubmit(e, {functions})}>
        <label>
          Say something...
          <input
            className='w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2'
            value={input}
            onChange={handleInputChange}
            style={{ color: 'black' }}
          />
        </label>
        <button type='submit'>Send</button>
      </form>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}:&nbsp;
          {(m.content === '') ? (typeof m.function_call === 'string' ? m.function_call : JSON.stringify(m.function_call) ) : m.content}
          <br/>
        </div>
      ))}
    </div>
  );
}