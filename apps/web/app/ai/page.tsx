"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowUp, BrainCircuit, Lightbulb, Link2, MessageSquareText, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import type { AiConversationDetail, AiConversationSummary, AiMessage } from "@visora/shared";
import AppShell from "../../components/AppShell";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return <span key={index}>{part}</span>;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let orderedItems: string[] = [];

  const flushLists = () => {
    if (listItems.length) {
      blocks.push(<ul key={`ul-${blocks.length}`}>{listItems.map((item, index) => <li key={index}>{renderInline(item)}</li>)}</ul>);
      listItems = [];
    }
    if (orderedItems.length) {
      blocks.push(<ol key={`ol-${blocks.length}`}>{orderedItems.map((item, index) => <li key={index}>{renderInline(item)}</li>)}</ol>);
      orderedItems = [];
    }
  };

  lines.forEach((line, index) => {
    if (/^\s*---+\s*$/.test(line)) { flushLists(); blocks.push(<hr key={index} />); return; }
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) { flushLists(); blocks.push(<h3 key={index}>{renderInline(heading[1])}</h3>); return; }
    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) { orderedItems = []; listItems.push(unordered[1]); return; }
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) { listItems = []; orderedItems.push(ordered[1]); return; }
    if (!line.trim()) { flushLists(); return; }
    flushLists(); blocks.push(<p key={index}>{renderInline(line)}</p>);
  });
  flushLists();
  return <div className="ai-markdown">{blocks}</div>;
}

export default function AIPage() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [conversations, setConversations] = useState<AiConversationSummary[]>([]);
  const [active, setActive] = useState<AiConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const authorizedFetch = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getToken();
    if (!token) throw new Error("Your session could not be verified.");
    const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers }, cache: "no-store" });
    if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || "Visora AI is unavailable.");
    return response.json();
  }, [getToken]);

  const openConversation = useCallback(async (id: string) => {
    setLoading(true); setError("");
    try { setActive(await authorizedFetch(`/ai/conversations/${id}`)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not open conversation."); }
    finally { setLoading(false); }
  }, [authorizedFetch]);

  useEffect(() => {
    void authorizedFetch("/ai/conversations").then((items: AiConversationSummary[]) => {
      setConversations(items);
      if (items[0]) void openConversation(items[0].id);
      else setLoading(false);
    }).catch((reason) => { setError(reason instanceof Error ? reason.message : "Could not load conversations."); setLoading(false); });
  }, [authorizedFetch, openConversation]);

  async function createConversation() {
    setError("");
    try {
      const conversation = await authorizedFetch("/ai/conversations", { method: "POST", body: JSON.stringify({ title: "New study conversation" }) }) as AiConversationDetail;
      setActive(conversation);
      setConversations((current) => [conversation, ...current]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create conversation."); }
  }

  async function deleteConversation() {
    if (!active) return;
    try {
      await authorizedFetch(`/ai/conversations/${active.id}`, { method: "DELETE" });
      const remaining = conversations.filter((item) => item.id !== active.id);
      setConversations(remaining);
      if (remaining[0]) await openConversation(remaining[0].id); else setActive(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete conversation."); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || sending) return;
    setError(""); setSending(true);
    try {
      let conversation = active;
      if (!conversation) conversation = await authorizedFetch("/ai/conversations", { method: "POST", body: JSON.stringify({ title: "New study conversation" }) }) as AiConversationDetail;
      await authorizedFetch(`/ai/conversations/${conversation.id}/messages`, { method: "POST", body: JSON.stringify({ content: prompt.trim() }) }) as AiMessage;
      const refreshed = await authorizedFetch(`/ai/conversations/${conversation.id}`) as AiConversationDetail;
      setActive(refreshed);
      setConversations((current) => [{ ...refreshed, messages: refreshed.messages.slice(0, 1) }, ...current.filter((item) => item.id !== refreshed.id)]);
      setPrompt("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not send message."); }
    finally { setSending(false); }
  }

  const suggestions = ["Explain visual acuity", "Create a 10-question optics quiz", "Summarise prism adaptation"];

  return (
    <AppShell active="Ask Visora AI">
      <div className="ai-page-layout">
        <header className="premium-page-header ai-page-header"><div><p className="premium-eyebrow">ACADEMIC STUDY COMPANION</p><h1>Ask Visora AI</h1></div><span className="ai-status"><i /> Course-aware</span></header>
        {error && <div className="alert alert-danger ai-alert" role="alert">{error}</div>}
        <section className="ai-chat-card">
          <div className="ai-chat-toolbar">
            <button type="button" className="button button-secondary" onClick={createConversation}><Plus size={15} /> New chat</button>
            {active && <button type="button" className="ai-delete-button" onClick={deleteConversation} aria-label="Delete conversation"><Trash2 size={15} /></button>}
          </div>
          {loading ? <div className="ai-chat-loading"><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></div> : active?.messages.length ? (
            <div className="ai-message-list" aria-live="polite">
              {active.messages.map((message) => (
                <article key={message.id} className={message.role === "USER" ? "ai-message ai-message-user" : "ai-message ai-message-assistant"}>
                  {message.role === "ASSISTANT" && <span className="ai-message-mark"><BrainCircuit size={15} /></span>}
                  <div>{message.role === "ASSISTANT" ? <MarkdownMessage content={message.content} /> : <p>{message.content}</p>}{Boolean(message.citations?.length) && <div className="ai-citations"><strong>Approved learning sources</strong>{message.citations.map((citation) => citation.externalUrl ? <a key={citation.id} href={citation.externalUrl} target="_blank" rel="noreferrer"><Link2 size={11} /> {citation.title}</a> : <span key={citation.id}><Link2 size={11} /> {citation.title}</span>)}</div>}</div>
                </article>
              ))}
              {sending && <article className="ai-message ai-message-assistant"><span className="ai-message-mark"><BrainCircuit size={15} /></span><div className="ai-thinking">Thinking…</div></article>}
            </div>
          ) : (
            <div className="ai-chat-empty">
              <span className="ai-chat-mark"><BrainCircuit size={25} /></span><p className="premium-eyebrow">VISORA AI</p><h2>What would you like to understand?</h2><p>Ask about a concept, request a summary, or turn your notes into a practice session.</p>
              <div className="ai-suggestions">{suggestions.map((suggestion, index) => <button type="button" key={suggestion} onClick={() => setPrompt(suggestion)}><span>{index === 0 ? <Lightbulb size={15} /> : index === 1 ? <MessageSquareText size={15} /> : <Link2 size={15} />}</span>{suggestion}</button>)}</div>
            </div>
          )}
          <form className="ai-composer" onSubmit={submit}><button type="button" className="ai-add-button" aria-label="Add context"><Plus size={18} /></button><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={1} maxLength={4000} placeholder="Ask a course or study question…" aria-label="Ask Visora AI" /><button type="submit" className="ai-send-button" disabled={!prompt.trim() || sending} aria-label="Send prompt"><ArrowUp size={18} /></button></form>
          <div className="ai-composer-note"><Sparkles size={11} /> Visora AI can make mistakes. Verify important academic details.</div>
        </section>
      </div>
    </AppShell>
  );
}
