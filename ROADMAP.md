## Roadmap: PDF Q&A MVP (≤ 2 hours)

### Goal
- **Build** a minimal web app to upload a PDF, extract text, and ask an LLM questions about it.

### Constraints and assumptions
- **Time-boxed**: ~2 hours total; prioritize a single, working path.
- **Client-only** for speed; API key entered in UI (not production-secure).
- **No backend** unless blocked by CORS/provider or extraction quality issues.

### Architecture (MVP)
- **Frontend**: Vite + React + TypeScript + TailwindCSS.
- **PDF extraction**: `pdfjs-dist` in the browser to extract text per page.
- **LLM**: Direct `fetch` to provider (Anthropic) using user-supplied key.
- **State**: In-memory; no persistence.

### Feature plan (MVP)
- **File upload**: Single PDF; basic validation and size limit.
- **Text extraction**: Parse all pages; combine into one string.
- **Question & Answer**: Input box + Ask button; show answer and selected sources.
- **UX basics**: Progress indicators, errors, token-safe truncation.

### Milestones and time estimates
- **Milestone 1: Project setup and UI skeleton (20 min)**
  - Inputs: API key, file upload, question box; area for answer and debug info.
  - Acceptance: Can upload a file and type a question (no logic yet).

- **Milestone 2: PDF text extraction (25 min)**
  - Add `pdfjs-dist`; extract text from all pages; show extracted character count.
  - Acceptance: After upload, extracted text length/preview visible.

- **Milestone 3: LLM integration (25 min)**
  - Call provider via `fetch` using user API key; prompt with top chunks + question; truncate context.
  - Acceptance: User asks a question and receives an answer.

- **Milestone 4: UX polish and guardrails (20 min)**
  - Loading states, error handling, size limit, clear “Reset” and “Copy answer” actions.
  - Acceptance: Smooth flow for a typical PDF; clear errors otherwise.

- **Buffer (10 min)**
  - Minor bug fixes and README usage notes.

### Tech choices
- **PDF parsing**: `pdfjs-dist` (client-side).
- **LLM**: Provider via `fetch`; model choice configurable.

### Acceptance criteria (end-to-end)
- **Upload** a PDF and see confirmation of extracted text (count/preview).
- **Ask** a question and receive a relevant answer referencing selected chunks.
- **Performance** is reasonable for small/medium PDFs (< 50 pages).
- **No runtime errors** in common flows.

### Stretch goals (only if time remains)
- **Show sources** with page numbers for each answer.
- **Streaming responses** for better UX.
- **Prompt presets** (e.g., concise vs. detailed).
- **Local persistence** via `localStorage` for session state.

### Risk and fallback plan
- **PDF extraction flaky**: Add minimal Node endpoint with `pdf-parse` and proxy via Vite.
- **Provider blocks browser calls/CORS**: Add tiny backend proxy for LLM requests.
- **Large PDFs**: Cap pages or add quick page-range selector.

### Deliverables
- **Working React app**: Upload → extract → ask → answer.
- **Instructions** in `README.md` for API key entry and usage.
- **Clean, minimal UI** suitable for demos.


