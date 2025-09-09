import { useCallback, useMemo, useRef, useState } from 'react'
import { anthropicComplete, DEFAULT_ANTHROPIC_MODEL, DEFAULT_MAX_TOKENS } from '../services/anthropic'

export type UseLLMOptions = {
  initialApiKey?: string
  model?: string
  maxTokens?: number
  temperature?: number
  system?: string
}

export function useLLM(options?: UseLLMOptions) {
  const envDefaultKey = (import.meta.env && (import.meta.env as any).VITE_ANTHROPIC_API_KEY) as string | undefined
  // Do not prefill the input from env for security; keep it blank unless user enters a value
  const [apiKey, setApiKey] = useState(options?.initialApiKey ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')

  const abortControllerRef = useRef<AbortController | null>(null)

  const model = options?.model ?? DEFAULT_ANTHROPIC_MODEL
  const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS
  const temperature = options?.temperature
  const system = options?.system

  const canSubmit = useMemo(() => {
    return Boolean((apiKey && apiKey.trim().length > 0) || (envDefaultKey && envDefaultKey.length > 0))
  }, [apiKey, envDefaultKey])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const complete = useCallback(
    async (prompt: string) => {
      setError(null)
      setIsLoading(true)
      setAnswer('')
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      try {
        const effectiveApiKey = (apiKey && apiKey.trim().length > 0) ? apiKey : (envDefaultKey ?? '')
        if (!effectiveApiKey) {
          throw new Error('Missing API key')
        }
        const result = await anthropicComplete({
          apiKey: effectiveApiKey,
          prompt,
          model,
          system,
          maxTokens,
          temperature,
          abortSignal: abortController.signal,
        })
        setAnswer(result.text)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [apiKey, maxTokens, model, system, temperature]
  )

  return {
    apiKey,
    setApiKey,
    isLoading,
    error,
    answer,
    canSubmit,
    complete,
    cancel,
    model,
    maxTokens,
    temperature,
    system,
  }
}

export type UseLLMReturn = ReturnType<typeof useLLM>


