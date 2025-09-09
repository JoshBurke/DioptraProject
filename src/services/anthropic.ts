const ANTHROPIC_API_URL = (import.meta && (import.meta as any).env && (import.meta as any).env.DEV)
  ? '/api/anthropic/v1/messages'
  : 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514"
export const DEFAULT_MAX_TOKENS = 512

export type CompleteParams = {
  apiKey: string
  prompt: string
  model?: string
  system?: string
  maxTokens?: number
  temperature?: number
  abortSignal?: AbortSignal
}

export type CompleteResult = {
  text: string
  raw: unknown
}

type AnthropicTextBlock = {
  type: 'text'
  text: string
}

type AnthropicMessageResponse = {
  id: string
  type: 'message'
  role: 'assistant'
  content: AnthropicTextBlock[]
  model: string
  stop_reason: string | null
  stop_sequence: string | null
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

export async function anthropicComplete(params: CompleteParams): Promise<CompleteResult> {
  const {
    apiKey,
    prompt,
    model = DEFAULT_ANTHROPIC_MODEL,
    system,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature,
    abortSignal,
  } = params

  if (!apiKey) {
    throw new Error('Anthropic API key is required')
  }
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt must be a non-empty string')
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  }

  if (typeof temperature === 'number') {
    body.temperature = temperature
  }
  if (system && system.trim().length > 0) {
    body.system = system
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
    signal: abortSignal,
  })

  const raw = await response.json().catch(() => null)

  if (!response.ok) {
    const message = (raw && (raw as any).error && (raw as any).error.message) || response.statusText
    throw new Error(`Anthropic error: ${message}`)
  }

  const data = raw as AnthropicMessageResponse
  const text = (data.content || [])
    .filter((b) => b && b.type === 'text')
    .map((b) => (b as AnthropicTextBlock).text)
    .join('')

  return { text, raw: data }
}


