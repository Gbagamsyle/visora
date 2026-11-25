"use client";

import { useState } from "react";
import { ArrowUp, BrainCircuit, Lightbulb, Link2, MessageSquareText, Plus, Sparkles } from "lucide-react";
import AppShell from "../../components/AppShell";

export default function AIPage() {
  const [prompt, setPrompt] = useState("");
  const suggestions = ["Explain visual acuity", "Create a 10-question optics quiz", "Summarise prism adaptation"];

  return (
    <AppShell active="Ask Visora AI">
      <div className="ai-page-layout">
        <header className="premium-page-header ai-page-header"><div><p className="premium-eyebrow">ACADEMIC STUDY COMPANION</p><h1>Ask Visora AI</h1></div><span className="ai-status"><i /> Ready to help</span></header>

        <section className="ai-chat-card">
          <div className="ai-chat-empty">
            <span className="ai-chat-mark"><BrainCircuit size={25} /></span>
            <p className="premium-eyebrow">VISORA AI</p>
            <h2>What would you like to understand?</h2>
            <p>Ask about a concept, request a summary, or turn your notes into a practice session.</p>
            <div className="ai-suggestions">
              {suggestions.map((suggestion, index) => <button type="button" key={suggestion} onClick={() => setPrompt(suggestion)}><span>{index === 0 ? <Lightbulb size={15} /> : index === 1 ? <MessageSquareText size={15} /> : <Link2 size={15} />}</span>{suggestion}</button>)}
            </div>
          </div>

          <form className="ai-composer" onSubmit={(event) => event.preventDefault()}>
            <button type="button" className="ai-add-button" aria-label="Add context"><Plus size={18} /></button>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={1} placeholder="Ask a course or study question…" aria-label="Ask Visora AI" />
            <button type="submit" className="ai-send-button" disabled={!prompt.trim()} aria-label="Send prompt"><ArrowUp size={18} /></button>
          </form>
          <div className="ai-composer-note"><Sparkles size={11} /> Visora AI can make mistakes. Verify important academic details.</div>
        </section>
      </div>
    </AppShell>
  );
}
