'use client';
import { nanoid } from 'nanoid';
import { ChatCompletionFunctions } from 'openai-edge/types/api';
import { FunctionCallHandler, Message } from 'ai';
import { useChat } from 'ai/react';
import { useEffect } from 'react';

export default function Chat() {
  const logHtml = function (cssClass: any, ...args: any) {
    const ln = document.createElement('div');
    if (cssClass) {
      ln.classList.add(cssClass);
    }
    ln.append(document.createTextNode(args.join(' ')));

    const loggingElement = document.getElementById('logging');
    if(loggingElement) {
      loggingElement.append(ln);
    } else {
      console.error('Element with id "logging" not found');
    }
  };


  useEffect(() => {
    const worker = new Worker(new URL("./worker.js", import.meta.url));

    worker.onmessage = function ({ data }) {
      switch (data.type) {
        case 'log':
          logHtml(data.payload.cssClass, ...data.payload.args);
          break;
        default:
          logHtml('error', 'Unhandled message:', data.type);
      }
    };
  }, []);


  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === 'create_and_execute_javascript_program') {
      if (functionCall.arguments) {
        // Parsing here does not always work since it seems that some characters in generated code aren't escaped properly.
        const parsedFunctionCallArguments: { code: string } = JSON.parse(
          functionCall.arguments
        )
        const result = eval(parsedFunctionCallArguments.code)
        const functionResponse = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'create_and_execute_javascript_program',
              role: 'function' as const,
              content: result.toString(),
            }
          ]
        }
        return functionResponse
      }
    }
  }


  const functions: ChatCompletionFunctions[] = [
    {
      name: 'create_and_execute_javascript_program',
      description: `Create and execute a Javascript program that will be executed in the browser. Do not import any libraries.
      The result of the last expression that gets evaluated in the program is what will be returned by the program when it is executed.
      Feel free to use DOM or Web APIs. DO NOT add any formatting in your code.`,
      parameters: {
        type: 'object',
        properties: {
          // purpose: {
          //   type: 'string',
          //   description: 'What is the purpose of this program?'
          // },
          code: {
            type: 'string',
            description: `Javascript code that will be executed. Do not use any formatting, backticks or newlines in your response.`
          }
        },
        required: ['code']
      }
    }
  ]

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit
  } = useChat({
    initialMessages: [
      {
        id: nanoid(),
        role: 'system' as const,
        content: `You are an AI assistant that is capable of executing javascript code in the browser. 
        You are helpful and do as you are told with the capabilities that you have.`
      }
      //   {
      //     id: nanoid(),
      //     role: 'system' as const,
      //     content: `You are an AI data scientist and assistant with access to a SQLite database.
      //      This database has been derived from an Airtable base so that it can be easily queried with SQL.
      //      You have the ability to create and execute complex Javascript programs that contain SQL queries, data transformations, and/or data visualizations.`
      //   }
    ],
    experimental_onFunctionCall: functionCallHandler
  });


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
    <div className="flex flex-row w-full max-w-lg py-24 mx-auto stretch space-x-4">
      <div className="flex flex-col w-1/2">
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

        <form onSubmit={e => handleSubmit(e)}>
          <input
            className="bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            style={{ color: 'black' }}
          />
        </form>
      </div>

      <div className="flex flex-col w-1/2">
        <div id="logging"></div>
      </div>
    </div>
  )
}