import React from 'react'

export type ChatMessageProps = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'
  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      {!isUser && (
        <div className="mr-3 mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs select-none">
          AI
        </div>
      )}
      <div
        className={
          `max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm text-left ` +
          (isUser
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-900 border border-gray-200')
        }
      >
        {content}
      </div>
      {isUser && (
        <div className="ml-3 mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs select-none">
          You
        </div>
      )}
    </div>
  )
}

export default ChatMessage


