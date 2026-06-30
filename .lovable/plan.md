
# ProfessionalAI — v1 Build Plan

Session-only (no login, no database). All AI powered by Lovable AI Gateway (`google/gemini-3-flash-preview`). Polished, modern, responsive UI.

## Scope

A working app shell with a sidebar dashboard and 5 functional AI tools:

1. **AI Chat Assistant** — streaming multi-turn chat
2. **Smart Email Generator** — context/tone/audience form → generated email
3. **Meeting Notes Summarizer** — paste notes → summary + decisions + action items
4. **AI Task Planner** — paste tasks/goals → prioritized schedule
5. **AI Research Assistant** — topic input → structured research brief

Plus a **Dashboard** landing page with quick-prompt, recent activity (session), and shortcuts to each tool.

## Pages / Routes

```
/                → Dashboard
/chat            → AI Chat Assistant (streaming)
/emails          → Smart Email Generator
/meetings        → Meeting Notes Summarizer
/planner         → Task Planner
/research        → Research Assistant
```

Out of scope for v1: Documents/file upload, Knowledge Base, Analytics, Settings, Auth, persistence across reloads, voice, integrations. (Sidebar can show these as "Coming soon".)

## Design Direction

Modern professional SaaS aesthetic — think Linear/Notion meets workplace tooling.

- Palette: deep slate background (`#0B1220`-ish) with soft white surfaces in light mode; single indigo/violet accent. Both light & dark themes.
- Typography: Inter for body, Space Grotesk for headings (via @fontsource).
- Layout: fixed left sidebar (desktop), collapsible drawer (tablet), bottom nav (mobile). Cards with subtle borders + soft shadows. Generous spacing. Framer Motion for subtle entrance/hover.
- Semantic tokens defined in `src/styles.css`; no hardcoded colors in components.

## Technical Approach

- **AI calls**: TanStack Start server functions (`createServerFn`) in `src/lib/ai.functions.ts` for one-shot tools; server route `src/routes/api/chat.ts` with `streamText` + `toUIMessageStreamResponse` for streaming chat.
- **Provider helper**: `src/lib/ai-gateway.server.ts` wrapping `@ai-sdk/openai-compatible` against `https://ai.gateway.lovable.dev/v1` with `Lovable-API-Key` header reading `process.env.LOVABLE_API_KEY`.
- **Chat UI**: AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`) installed via `bunx ai-elements@latest add ...`; `useChat` + `DefaultChatTransport` pointed at `/api/chat`; render `message.parts` with markdown.
- **Tool pages**: forms (shadcn) → call server fn → render markdown result with copy button. Structured tool outputs (email, meeting summary, planner, research) use AI SDK `Output.object` with Zod schemas for reliable rendering.
- **Session memory**: in-memory React state per page; dashboard "recent activity" stored in `sessionStorage`.
- **Layout**: pathless layout route `src/routes/_app.tsx` with sidebar + `<Outlet />`; all tool routes nested under it.

## Packages to add

`@ai-sdk/react`, `ai`, `@ai-sdk/openai-compatible`, `zod`, `react-markdown`, `framer-motion`, `@fontsource/inter`, `@fontsource/space-grotesk`. AI Elements components added via its CLI.

## Secrets

`LOVABLE_API_KEY` — provisioned automatically (no user action).

## Deliverable

A polished, responsive workplace AI app with 5 working AI features running on Lovable AI, ready to extend later with auth, persistence, and document upload.
