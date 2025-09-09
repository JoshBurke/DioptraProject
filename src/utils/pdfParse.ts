import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerSrc

export type PdfParseOptions = {
  signal?: AbortSignal
  onProgress?: (currentPage: number, totalPages: number) => void
}

export type PdfParseResult = {
  numPages: number
  pageTexts: string[]
  fullText: string
}

export async function parsePdf(arrayBuffer: ArrayBuffer, options: PdfParseOptions = {}): Promise<PdfParseResult> {
  const { signal, onProgress } = options

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  const loadingTask = getDocument({ data: new Uint8Array(arrayBuffer) })
  const doc = await loadingTask.promise

  try {
    const numPages = doc.numPages
    const pageTexts: string[] = []

    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      const page = await doc.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const strings: string[] = []
      for (const item of textContent.items as any[]) {
        if (typeof (item as any).str === 'string') {
          strings.push((item as any).str)
        }
      }
      const pageText = strings.join(' ')
      pageTexts.push(pageText)
      onProgress?.(pageNumber, numPages)
    }

    const fullText = pageTexts.join('\n\n')
    return { numPages, pageTexts, fullText }
  } finally {
    try {
      await (doc as any).cleanup?.()
    } catch {}
    try {
      await (doc as any).destroy?.()
    } catch {}
  }
}

export async function parsePdfFile(file: File, options?: PdfParseOptions): Promise<PdfParseResult> {
  const arrayBuffer = await file.arrayBuffer()
  return parsePdf(arrayBuffer, options)
}
