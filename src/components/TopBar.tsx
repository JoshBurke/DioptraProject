import React from 'react'

export type AttachmentBadge = {
  name: string
  numPages: number | null
  charCount: number | null
}

export type TopBarProps = {
  onFileSelected: (f: File | null) => void
  attachments?: AttachmentBadge[]
  isParsing?: boolean
  progressText?: string | null
  parseError?: string | null
  onAbortParse?: () => void
  onResetParse?: () => void
}

export function TopBar({
  onFileSelected,
  attachments,
  isParsing,
  progressText,
  parseError,
  onAbortParse,
  onResetParse,
}: TopBarProps) {
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null
    onFileSelected(f)
  }

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-3xl p-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-gray-900">PDF Q&A</h1>
          <div className="flex-1" />
          <label className="relative inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-gray-800">
            <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            Upload PDF
          </label>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-700">
          {attachments && attachments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a, idx) => (
                <span key={`${a.name}-${idx}`} className="group relative inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-1">
                  <span className="max-w-[12rem] truncate">{a.name}</span>
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-[10px] leading-none">i</span>
                  <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-max max-w-xs rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-700 shadow-lg group-hover:block">
                    {a.numPages != null && a.charCount != null ? (
                      <span>{a.numPages} pages • {a.charCount} chars</span>
                    ) : (
                      <span>Processing…</span>
                    )}
                  </div>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">No attachments</span>
          )}
          <div className="flex-1" />
          {isParsing ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{progressText ?? 'Parsing…'}</span>
              <button onClick={onAbortParse} className="px-2 py-1 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200">Cancel</button>
            </div>
          ) : null}
          {parseError ? <span className="text-red-600">{parseError}</span> : null}
          {(attachments && attachments.length > 0) || parseError ? (
            <button onClick={onResetParse} className="px-2 py-1 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200">Reset</button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default TopBar


