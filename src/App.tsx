import './App.css'
import { useState, type ChangeEvent, useEffect } from 'react'
import { usePdfParse } from './hooks/usePdfParse'
import { useLLM } from './hooks/useLLM'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [debug, setDebug] = useState('')

  const { isParsing, progress, result, error, parseFile, abort, reset } = usePdfParse()
  const {
    apiKey,
    setApiKey,
    isLoading: isAsking,
    error: llmError,
    answer: llmAnswer,
    canSubmit,
    complete,
    cancel: cancelAsk,
  } = useLLM()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setFile(selected)
    setAnswer('')
    reset()
    if (selected) {
      void parseFile(selected).catch(() => {})
    }
  }

  useEffect(() => {
    const debugInfo = {
      fileName: file ? file.name : null,
      fileSizeBytes: file ? file.size : null,
      questionChars: question.trim().length,
      parsing: isParsing,
      progress: progress ? { currentPage: progress.current, totalPages: progress.total } : null,
      numPages: result?.numPages ?? null,
      extractedChars: result?.fullText.length ?? null,
      error: error ?? null,
      llmError: llmError ?? null,
    }
    setDebug(JSON.stringify(debugInfo, null, 2))
  }, [file, question, isParsing, progress, result, error, llmError])

  const handleAsk = async () => {
    if (!result) return
    const context = result.fullText
    const prompt = `You are a helpful assistant. Use the following PDF content to answer the question. If the answer is not present, say you cannot find it.

PDF content:
${context.slice(0, 120000)}

Question: ${question}`
    try {
      const res = await complete(prompt)
      setAnswer(res.text)
    } catch {
      // error already captured in hook
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">PDF Q&A MVP</h1>

      <section className="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 className="text-lg font-medium mb-2">1. Upload PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-gray-100 file:px-3 file:py-1.5 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
        />
        {file && (
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <p>Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>
            {isParsing && (
              <p>Parsing pages {progress?.current ?? 0}/{progress?.total ?? 0}…</p>
            )}
            {!isParsing && result && (
              <p>Parsed {result.numPages} pages • {result.fullText.length} chars</p>
            )}
            {error && (
              <p className="text-red-600">Error: {error}</p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={abort}
                disabled={!isParsing}
                className="inline-flex items-center px-3 py-1 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => { setFile(null); reset(); }}
                className="inline-flex items-center px-3 py-1 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 className="text-lg font-medium mb-2">2. Ask a question</h2>
        <div className="mb-2 flex items-center gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Anthropic API key (VITE_ANTHROPIC_API_KEY is used by default)"
            className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500"
          />
          {isAsking ? (
            <button
              onClick={cancelAsk}
              className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
          ) : null}
        </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question about the PDF..."
          rows={4}
          className="w-full p-3 border border-gray-200 rounded-lg resize-y placeholder:text-gray-500 text-gray-900"
        />
        <div className="mt-2">
          <button
            onClick={handleAsk}
            disabled={!result || question.trim().length === 0 || !canSubmit || isAsking}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAsking ? 'Asking…' : 'Ask'}
          </button>
          {llmError && (
            <span className="ml-3 text-sm text-red-600">{llmError}</span>
          )}
        </div>
      </section>

      <section className="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 className="text-lg font-medium mb-2">Extracted text (preview)</h2>
        <div className="min-h-[8rem] max-h-80 overflow-auto p-3 border border-gray-200 rounded-lg bg-gray-50 whitespace-pre-wrap text-sm text-gray-800">
          {isParsing && 'Parsing…'}
          {!isParsing && result && result.fullText}
          {!isParsing && !result && 'No text extracted yet.'}
        </div>
      </section>

      <section className="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 className="text-lg font-medium mb-2">Answer</h2>
        <div className="min-h-[8rem] p-3 border border-gray-200 rounded-lg bg-gray-50 whitespace-pre-wrap text-gray-800">
          {answer || llmAnswer || 'No answer yet.'}
        </div>
      </section>

      <section className="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 className="text-lg font-medium mb-2">Debug</h2>
        <pre className="min-h-[8rem] p-3 border border-gray-200 rounded-lg bg-gray-100 overflow-auto text-xs text-gray-800 font-mono">{debug || 'No debug info yet.'}</pre>
      </section>
    </div>
  )
}

export default App
