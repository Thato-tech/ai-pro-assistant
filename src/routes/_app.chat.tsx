import { createFileRoute } from '@tanstack/react-router'
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PageHeader } from "@/components/tool-result";

type Search = { q?: string };

export const Route = createFileRoute("/_app/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant — ProfessionalAI" },
      {
        name: "description",
        content:
          "Chat with ProfessionalAI for drafting, planning, analysis, and workplace research.",
      },
      { property: "og:title", content: "AI Assistant — ProfessionalAI" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: ChatPage,
});

function ChatPage() {
  const { q } = Route.useSearch();
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (e) => console.error(e),
  });
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (q && !seeded) {
      setSeeded(true);
      sendMessage({ text: q });
    }
  }, [q, seeded, sendMessage]);

  return (
    <div className="flex h-screen flex-col">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 pt-6">
        <PageHeader
          eyebrow="Conversation"
          title="AI Assistant"
          description="Multi-turn AI built for professional work. Markdown supported."
          icon={MessageSquare}
        />
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-4xl px-5 sm:px-8">
          {messages.length === 0 && <EmptyState onPick={(t) => sendMessage({ text: t })} />}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent
                variant={m.role === "user" ? "contained" : "flat"}
                className={m.role === "user" ? "" : "bg-transparent"}
              >
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return m.role === "assistant" ? (
                      <MessageResponse key={i}>{part.text}</MessageResponse>
                    ) : (
                      <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <div className="px-1">
              <Shimmer>Thinking…</Shimmer>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-4">
          <Composer
            disabled={status === "submitted" || status === "streaming"}
            status={status}
            onSend={(text) => sendMessage({ text })}
          />
        </div>
      </div>
    </div>
  );
}

function Composer({
  onSend,
  disabled,
  status,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  status: "ready" | "submitted" | "streaming" | "error";
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  useEffect(() => {
    if (status === "ready") ref.current?.focus();
  }, [status]);
  return (
    <PromptInput
      onSubmit={({ text }) => {
        const v = text?.trim();
        if (!v) return;
        onSend(v);
      }}
    >
      <PromptInputTextarea
        ref={ref as never}
        placeholder="Ask anything — draft an email, summarize notes, plan a week…"
      />
      <PromptInputFooter className="justify-end">
        <PromptInputSubmit status={status} disabled={disabled} />
      </PromptInputFooter>
    </PromptInput>
  );
}

function EmptyState({ onPick }: { onPick: (t: string) => void }) {
  const samples = [
    "Draft a polite follow-up to a client who hasn't replied in a week.",
    "Summarize the key risks in launching a new SaaS product in Q1.",
    "Help me prepare a 1:1 agenda for an underperforming team member.",
    "Translate this paragraph into formal French and shorten by 30%.",
  ];
  return (
    <div className="py-10">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
        <Sparkles className="h-5 w-5" />
      </div>
      <h2 className="font-display text-xl font-semibold">How can I help today?</h2>
      <p className="text-sm text-muted-foreground mt-1">Pick a prompt or type your own.</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {samples.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left rounded-xl border border-border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:bg-accent/40 transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
