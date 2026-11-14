"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ChatLog from "@/components/ChatLog";
import { useCarlo } from "@/components/Providers";
import { reply } from "@/lib/carlo";
import { CHAT } from "@/lib/chat";

const TOPICS = [["How much car can I afford?"], ["I'm at the dealership right now. What should I say?", "I'm at the dealership right now"], ["Can you check this quote from a dealer?", "Check a dealer's quote"],
  ["Can I practice negotiating with you?", "Practice negotiating"], ["Should I get pre-approved before I go?", "Should I get pre-approved?"], ["Which add-ons can I say no to?"]];

export default function CarloPage() {
  const q = useSearchParams().get("q") || "";
  const { apr, band, setCredit } = useCarlo();
  // No conversation yet shows the example one. chat holds the messages and where Carlo is in a flow.
  const step = (chat, msg) => {
    const r = reply(chat.state, msg, { apr, band });
    return { log: [...chat.log, ["me", msg], ...r.msgs], state: r.state, credit: r.credit };
  };
  const [chat, setChat] = useState(() => q ? step({ log: [] }, q) : null);
  const [text, setText] = useState("");
  const logEl = useRef(), input = useRef();
  const log = chat?.log;
  useEffect(() => { if (log) logEl.current.scrollTop = logEl.current.scrollHeight; }, [log]);
  useEffect(() => { if (chat?.credit != null) setCredit(chat.credit); }, [chat, setCredit]);

  function send(msg) {
    msg = msg.trim();
    if (!msg) return input.current.focus();
    setChat(step(chat || { log: [] }, msg));
    setText("");
  }

  return (
    <section className="in page">
      <div className="cp-grid">
        <aside className="cp-side">
          <div className="who"><span className="avatar" aria-hidden="true">c</span><div><h1 className="cp-title">Ask Carlo</h1><p className="muted">Your guide to buying a first car.</p></div></div>
          <p className="f-label">Start with</p>
          <div className="cp-topics">{TOPICS.map(([q, label = q]) => <button key={q} type="button" onClick={() => send(q)}>{label}</button>)}</div>
        </aside>
        <section className="chat cp-chat" aria-label="Conversation with Carlo">
          <div className="chat-head"><span className="avatar" aria-hidden="true">c</span><span><b>Carlo</b><small>{log ? "Your conversation" : "Example conversation"}</small></span></div>
          <ChatLog msgs={log || CHAT} ref={logEl} aria-live="polite" />
          <form className="cp-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <label className="sr" htmlFor="cp-input">Message Carlo</label>
            <textarea id="cp-input" ref={input} rows={1} maxLength={4000} placeholder="Message Carlo" value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} />
            <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </form>
          <p className="cp-note">Carlo works from set scripts and loan maths for now, and can get things wrong. Check the numbers before you sign, and never share your Social Security number or card details.</p>
        </section>
      </div>
    </section>
  );
}
