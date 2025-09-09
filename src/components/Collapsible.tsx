import React, { useState } from 'react'

export type CollapsibleProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function Collapsible({ title, children, defaultOpen }: CollapsibleProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-900"
      >
        <span>{title}</span>
        <span className="text-gray-500">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
          {children}
        </div>
      )}
    </div>
  )
}

export default Collapsible


