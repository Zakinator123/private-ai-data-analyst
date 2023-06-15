'use client';

import { useCompletion } from 'ai/react';

// TODO: Wrap in server component that redirects if you are not signed in.
export default function SloganGenerator() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion();

  return (
    <div className='mx-auto w-full max-w-md py-24 flex flex-col stretch'>
      test
      <form onSubmit={handleSubmit}>
        <input
          className='w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2'
          value={input}
          placeholder='Describe your business...'
          onChange={handleInputChange}
          style={{color: 'black'}}
        />
      </form>
      <div>
        <div className='whitespace-pre-wrap my-6'>{completion}</div>
      </div>
    </div>
  );
}