import './App.css'
import { useMemo, useState } from 'react'
import { usePdfParse } from './hooks/usePdfParse'
import { useLLM } from './hooks/useLLM'
import { TopBar, type AttachmentBadge } from './components/TopBar'
import { ChatThread, type ThreadMessage } from './components/ChatThread'
import { ChatComposer } from './components/ChatComposer'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])

  const { isParsing, progress, result, error, parseFile, abort, reset } = usePdfParse()
  const {
    isLoading: isAsking,
    error: llmError,
    canSubmit,
    complete,
    cancel: cancelAsk,
  } = useLLM()

  const progressText = useMemo(() => {
    if (!isParsing) return null
    const current = progress?.current ?? 0
    const total = progress?.total ?? 0
    return `Parsing pages ${current}/${total}…`
  }, [isParsing, progress])

  const attachments: AttachmentBadge[] | undefined = useMemo(() => {
    if (!file) return undefined
    return [
      {
        name: file.name,
        numPages: result?.numPages ?? null,
        charCount: result?.fullText.length ?? null,
      },
    ]
  }, [file, result])

  const handleSelectFile = (selected: File | null) => {
    setFile(selected)
    reset()
    if (selected) {
      void parseFile(selected).catch(() => {})
    }
  }

  const buildPrompt = (userText: string) => {
    const context = result?.fullText ?? ''
    const trimmedContext = context.slice(0, 120000)
    const header = 'You are a helpful assistant. Use the PDF content if relevant. If the answer is not present, say you cannot find it.'
    if (trimmedContext.length > 0) {
      return `${header}\n\nPDF content:\n${trimmedContext}\n\nQuestion: ${userText}`
    }
    return `${header}\n\nQuestion: ${userText}`
  }

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const id = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
      ? (globalThis.crypto as any).randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setMessages((prev) => [...prev, { id, role, content }])
  }

  const handleSend = async (text: string) => {
    addMessage('user', text)
    try {
      const res = await complete(buildPrompt(text))
      addMessage('assistant', res.text)
    } catch {
      // error already captured in hook
    }
  }

  return (
    <div className="h-full max-h-full flex flex-col bg-white text-left overflow-hidden">
      <TopBar
        onFileSelected={handleSelectFile}
        attachments={attachments}
        isParsing={isParsing}
        progressText={progressText}
        parseError={error}
        onAbortParse={abort}
        onResetParse={() => { setFile(null); reset() }}
      />

      <ChatThread messages={messages} isLoading={isAsking} />

      {llmError ? (
        <div className="mx-auto max-w-3xl w-full px-4 pb-2 text-sm text-red-600">{llmError}</div>
      ) : null}

      <ChatComposer
        onSubmit={handleSend}
        disabled={!canSubmit}
        isLoading={isAsking}
        onStop={cancelAsk}
      />

      <div className="h-2" />
    </div>
  )
}

export default App
