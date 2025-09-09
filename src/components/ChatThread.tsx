import React, { useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'

export type ThreadMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ChatThreadProps = {
  messages: ThreadMessage[]
  isLoading?: boolean
}

export function ChatThread({ messages, isLoading }: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

  return (
    <div className="flex-1 overflow-auto px-4">
      <div className="mx-auto max-w-3xl py-4">
        {messages.map((m) => (
          <ChatMessage key={m.id} role={m.role} content={m.content} />
        ))}
        {isLoading ? (
          <div className="w-full flex justify-start my-2">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-gray-100 text-gray-500 border border-gray-200">
              Thinking…
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
    </div>
  )
}

export default ChatThread


