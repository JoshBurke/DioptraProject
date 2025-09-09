import { useCallback, useMemo, useRef, useState } from 'react'
import { parsePdf, type PdfParseResult } from '../utils/pdfParse'

export function usePdfParse() {
  const [isParsing, setIsParsing] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [result, setResult] = useState<PdfParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    setIsParsing(false)
    setProgress(null)
    setResult(null)
    setError(null)
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const parseFile = useCallback(async (file: File) => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsParsing(true)
    setError(null)
    setProgress({ current: 0, total: 0 })

    try {
      const buffer = await file.arrayBuffer()
      const res = await parsePdf(buffer, {
        signal: controller.signal,
        onProgress: (current, total) => setProgress({ current, total }),
      })
      setResult(res)
      return res
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        setError('Parsing cancelled')
      } else {
        setError(e?.message || 'Failed to parse PDF')
      }
      throw e
    } finally {
      setIsParsing(false)
    }
  }, [])

  return useMemo(
    () => ({ isParsing, progress, result, error, parseFile, abort, reset }),
    [isParsing, progress, result, error, parseFile, abort, reset]
  )
}
