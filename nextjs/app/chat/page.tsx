'use client';
import { nanoid } from 'nanoid';
import { ChatCompletionFunctions } from 'openai-edge/types/api';
import { FunctionCallHandler, Message } from 'ai';
import { useChat } from 'ai/react';

const functions: ChatCompletionFunctions[] = [
  {
    name: 'eval_code_in_browser',
    description: 'Execute javascript code in the browser with eval().',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: `Javascript code that will be directly executed via eval(). Do not use backticks in your response.
           DO NOT include any newlines in your response, and be sure to provide only valid JSON when providing the arguments object.
           The output of the eval() will be returned directly by the function.`
        }
      },
      required: ['code']
    }
  }
]

export default function Chat() {
  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === 'eval_code_in_browser') {
      if (functionCall.arguments) {
        // Parsing here does not always work since it seems that some characters in generated code aren't escaped properly.
        const parsedFunctionCallArguments: { code: string } = JSON.parse(
          functionCall.arguments
        );
        const functionResponse = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'eval_code_in_browser',
              role: 'function' as const,
              content: JSON.stringify(eval(parsedFunctionCallArguments.code))
            }
          ]
        };
        return functionResponse;
      }
    }
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit
  } = useChat({ experimental_onFunctionCall: functionCallHandler });


  // Generate a map of message role to text color
  const roleToColorMap: Record<Message['role'], string> = {
    system: 'red',
    user: 'white',
    function: 'blue',
    assistant: 'green'
  }

  const getRenderedMessage = (m: Message) => {
    if (m.content === '' && m.function_call !== undefined) {
      const functionCallString =
        typeof m.function_call === 'string'
          ? m.function_call
          : JSON.stringify(m.function_call)
      return (
        <>
          {functionCallString.split('\\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </>
      )
    } else {
      return m.content
    }
  }

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map((m: Message) => (
          <div
            key={m.id}
            className="whitespace-pre-wrap"
            style={{ color: roleToColorMap[m.role] }}
          >
            <strong>{`${m.role}: `}</strong>
            {getRenderedMessage(m)}
            <br />
            <br />
          </div>
        ))
        : null}
      <div id="chart-goes-here"></div>

      <form onSubmit={e => handleSubmit(e, {functions})}>
        <input
          className="bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          style={{ color: 'black' }}
        />
      </form>
    </div>
  )
}