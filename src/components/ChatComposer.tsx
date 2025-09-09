import React, { useState } from 'react'

export type ChatComposerProps = {
  onSubmit: (text: string) => void
  disabled?: boolean
  onStop?: () => void
  isLoading?: boolean
}

export function ChatComposer({ onSubmit, disabled, onStop, isLoading }: ChatComposerProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white text-left">
      <div className="mx-auto max-w-3xl p-3">
        <div className="flex items-baseline gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Send a message"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 p-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {isLoading ? (
            <button
              onClick={onStop}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}

export default ChatComposer


